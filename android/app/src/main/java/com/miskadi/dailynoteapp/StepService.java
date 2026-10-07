package com.miskadi.dailynoteapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class StepService extends Service implements SensorEventListener {
    private static final String TAG = "DailyNoteStepService";
    public static final String ACTION_STEP_UPDATE = "com.miskadi.dailynoteapp.STEP_UPDATE";
    public static final String EXTRA_TODAY_STEPS = "today_steps";

    public static final String PREFS_NAME = "DailyNoteStepPrefs";
    public static final String PREF_BASELINE_STEPS = "baseline_steps";
    public static final String PREF_BASELINE_DATE = "baseline_date";
    public static final String PREF_TODAY_STEPS = "today_steps";
    public static final String PREF_SAVED_OFFSET = "saved_offset";

    private static final String CHANNEL_ID = "daily_note_pedometer_channel";
    private static final int NOTIF_ID = 9101;

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private Sensor accelerometerSensor;
    private SharedPreferences stepPrefs;

    private int currentTodaySteps = 0;
    private long lastNotifUpdateTime = 0;

    // Accelerometer fallback peak-detection filter
    private float gravity = 9.8f;
    private long lastStepTimestamp = 0;
    private static final float STEP_THRESHOLD = 2.4f;
    private static final long MIN_STEP_INTERVAL_MS = 280;

    @Override
    public void onCreate() {
        super.onCreate();
        stepPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        currentTodaySteps = stepPrefs.getInt(PREF_TODAY_STEPS, 0);

        createNotificationChannel();
        startForegroundSafely();
        registerSensors();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "દૈનિક સ્ટેપ ટ્રેકિંગ (Step Tracker)",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("દરરોજના સ્ટેપ ગણતરી અને હેલ્થ ટ્રેકિંગ");
            channel.setShowBadge(false);
            channel.enableVibration(false);
            channel.setSound(null, null);

            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void startForegroundSafely() {
        try {
            Notification notif = buildNotification(currentTodaySteps);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
            } else {
                startForeground(NOTIF_ID, notif);
            }
        } catch (Throwable t) {
            Log.w(TAG, "startForeground notice: " + t.getMessage());
        }
    }

    private Notification buildNotification(int steps) {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );

        double km = (steps * 0.76) / 1000.0;
        String contentText = String.format(Locale.US, "આજના ડગલાં: %,d • %.2f કિમી", steps, km);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Daily Note હેલ્થ ટ્રેકર 👟")
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build();
    }

    private void updateNotification(int steps) {
        long now = System.currentTimeMillis();
        // Throttle notification visual updates to avoid excessive OS overhead
        if (now - lastNotifUpdateTime > 2000) {
            lastNotifUpdateTime = now;
            try {
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.notify(NOTIF_ID, buildNotification(steps));
                }
            } catch (Throwable ignored) {}
        }
    }

    private void registerSensors() {
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager == null) return;

        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);

        if (stepCounterSensor != null) {
            sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
            Log.d(TAG, "Hardware TYPE_STEP_COUNTER registered in background service");
        } else if (stepDetectorSensor != null) {
            sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
            Log.d(TAG, "Hardware TYPE_STEP_DETECTOR registered in background service");
        } else {
            // Fallback for budget phones without hardware step chip
            accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            if (accelerometerSensor != null) {
                sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_GAME);
                Log.d(TAG, "TYPE_ACCELEROMETER fallback registered in background service");
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        registerSensors();
        return START_STICKY;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event == null || event.sensor == null) return;

        String todayDate = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String savedDate = stepPrefs.getString(PREF_BASELINE_DATE, "");

        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            float rawValue = event.values[0];
            int totalHardwareSteps = (int) rawValue;
            int baseline = stepPrefs.getInt(PREF_BASELINE_STEPS, 0);
            int offset = stepPrefs.getInt(PREF_SAVED_OFFSET, 0);

            // Midnight date change: reset daily count
            if (!todayDate.equals(savedDate)) {
                baseline = totalHardwareSteps;
                offset = 0;
                currentTodaySteps = 0;
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_BASELINE_STEPS, baseline)
                    .putInt(PREF_SAVED_OFFSET, 0)
                    .putInt(PREF_TODAY_STEPS, 0)
                    .apply();
            } else if (baseline <= 0) {
                baseline = totalHardwareSteps;
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_BASELINE_STEPS, baseline)
                    .apply();
            } else if (totalHardwareSteps < baseline) {
                // Device rebooted: preserve previous steps as offset
                offset += (stepPrefs.getInt(PREF_TODAY_STEPS, 0));
                baseline = totalHardwareSteps;
                stepPrefs.edit()
                    .putInt(PREF_SAVED_OFFSET, offset)
                    .putInt(PREF_BASELINE_STEPS, baseline)
                    .apply();
            }

            currentTodaySteps = offset + (totalHardwareSteps - baseline);
            if (currentTodaySteps < 0) currentTodaySteps = 0;
            stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();

            broadcastStepUpdate(currentTodaySteps);
            updateNotification(currentTodaySteps);

        } else if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            // Triggered on every detected single step
            if (!todayDate.equals(savedDate)) {
                currentTodaySteps = 0;
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_TODAY_STEPS, 0)
                    .apply();
            }
            if (event.values.length > 0 && event.values[0] == 1.0f) {
                currentTodaySteps++;
                stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();
                broadcastStepUpdate(currentTodaySteps);
                updateNotification(currentTodaySteps);
            }

        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            // Software peak-detection fallback for devices lacking step counter
            if (!todayDate.equals(savedDate)) {
                currentTodaySteps = 0;
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_TODAY_STEPS, 0)
                    .apply();
            }

            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            float magnitude = (float) Math.sqrt(x * x + y * y + z * z);

            gravity = 0.85f * gravity + 0.15f * magnitude;
            float linearAcc = Math.abs(magnitude - gravity);

            long now = System.currentTimeMillis();
            if (linearAcc > STEP_THRESHOLD && (now - lastStepTimestamp > MIN_STEP_INTERVAL_MS)) {
                lastStepTimestamp = now;
                currentTodaySteps++;
                stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();
                broadcastStepUpdate(currentTodaySteps);
                updateNotification(currentTodaySteps);
            }
        }
    }

    private void broadcastStepUpdate(int steps) {
        Intent intent = new Intent(ACTION_STEP_UPDATE);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_TODAY_STEPS, steps);
        sendBroadcast(intent);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        super.onDestroy();
    }
}
