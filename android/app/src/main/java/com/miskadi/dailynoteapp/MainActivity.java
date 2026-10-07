package com.miskadi.dailynoteapp;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.ContactsContract;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends BridgeActivity implements SensorEventListener {
    private static final String TAG = "DailyNoteMainActivity";
    private static final int PERMISSION_REQ_CODE = 1002;
    private static final int REQ_PICK_CONTACT = 2001;

    private static final String PREFS_NAME = "DailyNoteStepPrefs";
    private static final String PREF_BASELINE_STEPS = "baseline_steps";
    private static final String PREF_BASELINE_DATE = "baseline_date";
    private static final String PREF_TODAY_STEPS = "today_steps";
    private static final String PREF_SAVED_OFFSET = "saved_offset";

    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private Sensor accelerometerSensor;
    private SharedPreferences stepPrefs;
    private int currentTodaySteps = 0;

    private String pendingContactContext = null;
    private BroadcastReceiver stepUpdateReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestAppPermissions();
        startBackgroundStepService();
        setupStepSensors();
        setupStepUpdateReceiver();
        setupNativeSpeechBridge();
        setupNativeStepBridge();
        setupNativePermissionBridge();
    }

    private void startBackgroundStepService() {
        try {
            Intent serviceIntent = new Intent(this, StepService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Failed to start StepService: " + t.getMessage());
        }
    }

    private void setupStepUpdateReceiver() {
        stepUpdateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent != null && StepService.ACTION_STEP_UPDATE.equals(intent.getAction())) {
                    int steps = intent.getIntExtra(StepService.EXTRA_TODAY_STEPS, 0);
                    currentTodaySteps = steps;
                    sendJsStepUpdate(steps);
                }
            }
        };
        IntentFilter filter = new IntentFilter(StepService.ACTION_STEP_UPDATE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stepUpdateReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(stepUpdateReceiver, filter);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        startBackgroundStepService();
        if (sensorManager == null || (stepCounterSensor == null && stepDetectorSensor == null)) {
            setupStepSensors();
        } else {
            registerStepSensors();
        }
        syncHardwareStepsWithJs();
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            Log.d(TAG, "Permissions updated, syncing steps and notifying web layer");
            setupStepSensors();
            registerStepSensors();
            startBackgroundStepService();
            syncHardwareStepsWithJs();

            pendingContactContext = null;

            mainHandler.post(() -> {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    this.bridge.getWebView().evaluateJavascript("if (window.onNativePermissionsResult) { window.onNativePermissionsResult(); }", null);
                }
            });
        }
    }

    private void requestAppPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ArrayList<String> permissionsToRequest = new ArrayList<>();

            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.RECORD_AUDIO);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.MODIFY_AUDIO_SETTINGS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS);
                }
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.READ_MEDIA_IMAGES);
                }
            } else {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE);
                }
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.ACTIVITY_RECOGNITION);
                }
            }
            // Contacts Access
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.READ_CONTACTS);
            }

            if (!permissionsToRequest.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[0]), PERMISSION_REQ_CODE);
            }
        }
    }

    // -------------------------------------------------------------
    // Hardware Step Sensors Setup & Background Counter
    // -------------------------------------------------------------
    private void setupStepSensors() {
        stepPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        currentTodaySteps = stepPrefs.getInt(PREF_TODAY_STEPS, 0);

        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
            accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            registerStepSensors();
        }
    }

    private void registerStepSensors() {
        if (sensorManager != null) {
            if (stepCounterSensor != null) {
                sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
                Log.d(TAG, "Hardware STEP_COUNTER registered successfully in MainActivity");
            } else if (stepDetectorSensor != null) {
                sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
                Log.d(TAG, "Hardware STEP_DETECTOR registered successfully in MainActivity");
            } else if (accelerometerSensor != null) {
                sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_GAME);
                Log.d(TAG, "Accelerometer fallback registered in MainActivity");
            }
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event == null || event.sensor == null) return;

        String todayDate = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            float rawValue = event.values[0];
            int totalHardwareSteps = (int) rawValue;

            String savedDate = stepPrefs.getString(PREF_BASELINE_DATE, "");
            int baseline = stepPrefs.getInt(PREF_BASELINE_STEPS, 0);
            int offset = stepPrefs.getInt(PREF_SAVED_OFFSET, 0);

            // If day changed: reset today's baseline
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
                // Device rebooted: preserve previously walked steps
                offset += stepPrefs.getInt(PREF_TODAY_STEPS, 0);
                baseline = totalHardwareSteps;
                stepPrefs.edit()
                    .putInt(PREF_SAVED_OFFSET, offset)
                    .putInt(PREF_BASELINE_STEPS, baseline)
                    .apply();
            }

            currentTodaySteps = offset + (totalHardwareSteps - baseline);
            if (currentTodaySteps < 0) currentTodaySteps = 0;
            stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();

            sendJsStepUpdate(currentTodaySteps);
        } else if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            String savedDate = stepPrefs.getString(PREF_BASELINE_DATE, "");
            if (!todayDate.equals(savedDate)) {
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_TODAY_STEPS, 0)
                    .apply();
                currentTodaySteps = 0;
            }
            if (event.values.length > 0 && event.values[0] == 1.0f) {
                currentTodaySteps++;
                stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();
                sendJsStepDetected(1);
                sendJsStepUpdate(currentTodaySteps);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    private void sendJsStepUpdate(int steps) {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                String js = "if (window.onNativeStepCountUpdate) { window.onNativeStepCountUpdate(" + steps + "); }";
                this.bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }

    private void sendJsStepDetected(int count) {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                String js = "if (window.onNativeStepDetected) { window.onNativeStepDetected(" + count + "); }";
                this.bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }

    private void syncHardwareStepsWithJs() {
        if (stepPrefs != null) {
            int saved = stepPrefs.getInt(PREF_TODAY_STEPS, 0);
            sendJsStepUpdate(saved);
        }
    }

    private void setupNativeStepBridge() {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean isHardwareStepSupported() {
                        return stepCounterSensor != null || stepDetectorSensor != null || accelerometerSensor != null;
                    }

                    @JavascriptInterface
                    public int getTodaySteps() {
                        return stepPrefs != null ? stepPrefs.getInt(PREF_TODAY_STEPS, 0) : 0;
                    }

                    @JavascriptInterface
                    public void syncSteps() {
                        syncHardwareStepsWithJs();
                    }

                    @JavascriptInterface
                    public void requestPermission() {
                        mainHandler.post(() -> requestAppPermissions());
                    }
                }, "AndroidStepBridge");
            }
        });
    }

    // -------------------------------------------------------------
    // Native Contact Picker
    // -------------------------------------------------------------
    private void launchContactPicker() {
        try {
            Intent intent = new Intent(Intent.ACTION_PICK, ContactsContract.CommonDataKinds.Phone.CONTENT_URI);
            startActivityForResult(intent, REQ_PICK_CONTACT);
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch native contact picker", e);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_PICK_CONTACT && resultCode == RESULT_OK && data != null) {
            Uri contactUri = data.getData();
            if (contactUri != null) {
                String name = "";
                String phone = "";
                Cursor cursor = null;
                try {
                    cursor = getContentResolver().query(
                        contactUri,
                        new String[]{
                            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                            ContactsContract.CommonDataKinds.Phone.NUMBER
                        },
                        null, null, null
                    );
                    if (cursor != null && cursor.moveToFirst()) {
                        int nameIdx = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                        int phoneIdx = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                        if (nameIdx != -1) name = cursor.getString(nameIdx);
                        if (phoneIdx != -1) phone = cursor.getString(phoneIdx);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error querying picked contact", e);
                } finally {
                    if (cursor != null) cursor.close();
                }

                final String finalName = (name != null ? name.trim() : "");
                String cleanNum = (phone != null ? phone.replaceAll("[^0-9+]", "") : "").trim();
                if (cleanNum.startsWith("+91") && cleanNum.length() == 13) {
                    cleanNum = cleanNum.substring(3);
                }
                final String finalPhone = cleanNum;
                final String ctx = (pendingContactContext != null) ? pendingContactContext : "khata";

                mainHandler.post(() -> {
                    if (this.bridge != null && this.bridge.getWebView() != null) {
                        String escapedName = finalName.replace("\\", "\\\\").replace("'", "\\'").replace("\"", "\\\"").replace("\n", "");
                        String escapedPhone = finalPhone.replace("\\", "\\\\").replace("'", "\\'");
                        String js = "if (window.onNativeContactPicked) { window.onNativeContactPicked('" + escapedName + "', '" + escapedPhone + "', '" + ctx + "'); }";
                        this.bridge.getWebView().evaluateJavascript(js, null);
                    }
                });
            }
        }
    }

    // -------------------------------------------------------------
    // Native Permissions Bridge for Web UI
    // -------------------------------------------------------------
    private void setupNativePermissionBridge() {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean hasPhotoPermission() {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED;
                        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
                        }
                        return true;
                    }

                    @JavascriptInterface
                    public void requestPhotoPermission() {
                        mainHandler.post(() -> {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.READ_MEDIA_IMAGES}, PERMISSION_REQ_CODE);
                            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}, PERMISSION_REQ_CODE);
                            }
                        });
                    }

                    @JavascriptInterface
                    public boolean hasContactPermission() {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED;
                        }
                        return true;
                    }

                    @JavascriptInterface
                    public void requestContactPermission() {
                        mainHandler.post(() -> {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.READ_CONTACTS}, PERMISSION_REQ_CODE);
                            }
                        });
                    }

                    @JavascriptInterface
                    public void pickContact(final String context) {
                        pendingContactContext = (context != null && !context.isEmpty()) ? context : "khata";
                        mainHandler.post(() -> {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                                ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
                                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.READ_CONTACTS}, PERMISSION_REQ_CODE);
                            } else {
                                launchContactPicker();
                            }
                        });
                    }

                    @JavascriptInterface
                    public void requestAllPermissions() {
                        mainHandler.post(() -> requestAppPermissions());
                    }

                    @JavascriptInterface
                    public String getPermissionsStatusJson() {
                        boolean audio = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
                        boolean notif = true;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            notif = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
                        }
                        boolean steps = true;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            steps = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
                        }
                        boolean photos = hasPhotoPermission();
                        boolean contacts = hasContactPermission();
                        return "{\"audio\":" + audio + ",\"notifications\":" + notif + ",\"steps\":" + steps + ",\"photos\":" + photos + ",\"contacts\":" + contacts + "}";
                    }
                }, "AndroidPermissionBridge");
            }
        });
    }

    // -------------------------------------------------------------
    // Native Android Speech Recognition Bridge
    // -------------------------------------------------------------
    private void setupNativeSpeechBridge() {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean isAvailable() {
                        return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
                    }

                    @JavascriptInterface
                    public void requestPermission() {
                        mainHandler.post(() -> requestAppPermissions());
                    }

                    @JavascriptInterface
                    public boolean hasPermission() {
                        return ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
                    }

                    @JavascriptInterface
                    public void startListening(final String langCode) {
                        mainHandler.post(() -> startAndroidSpeechRecognition(langCode));
                    }

                    @JavascriptInterface
                    public void stopListening() {
                        mainHandler.post(() -> stopAndroidSpeechRecognition());
                    }
                }, "AndroidSpeechBridge");
            }
        });
    }

    private void startAndroidSpeechRecognition(String langCode) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestAppPermissions();
            sendJsSpeechEvent("onNativeSpeechError", "permission_denied");
            return;
        }

        try {
            if (speechRecognizer != null) {
                try {
                    speechRecognizer.destroy();
                } catch (Exception ignored) {}
                speechRecognizer = null;
            }

            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            Intent speechIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);

            String targetLang = "gu-IN";
            if (langCode != null && !langCode.isEmpty()) {
                if (langCode.startsWith("gu")) targetLang = "gu-IN";
                else if (langCode.startsWith("hi")) targetLang = "hi-IN";
                else if (langCode.startsWith("en")) targetLang = "en-IN";
                else targetLang = langCode;
            }

            speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, targetLang);
            speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, targetLang);
            speechIntent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, targetLang);
            speechIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            speechIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);

            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    sendJsSpeechEvent("onNativeSpeechReady", "");
                }

                @Override
                public void onBeginningOfSpeech() {
                    sendJsSpeechEvent("onNativeSpeechStart", "");
                }

                @Override
                public void onRmsChanged(float rmsdB) {}

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    sendJsSpeechEvent("onNativeSpeechEnd", "");
                }

                @Override
                public void onError(int error) {
                    Log.w(TAG, "SpeechRecognizer error: " + error);
                    String errorMsg = "error_" + error;
                    if (error == SpeechRecognizer.ERROR_NO_MATCH) errorMsg = "no_match";
                    else if (error == SpeechRecognizer.ERROR_NETWORK) errorMsg = "network";
                    else if (error == SpeechRecognizer.ERROR_AUDIO) errorMsg = "audio";
                    else if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) errorMsg = "permission_denied";
                    else if (error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) errorMsg = "timeout";

                    sendJsSpeechEvent("onNativeSpeechError", errorMsg);
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        String recognized = matches.get(0);
                        sendJsSpeechEvent("onNativeSpeechResult", recognized);
                    } else {
                        sendJsSpeechEvent("onNativeSpeechError", "no_match");
                    }
                }

                @Override
                public void onPartialResults(Bundle partialResults) {
                    ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        String partial = matches.get(0);
                        sendJsSpeechEvent("onNativeSpeechPartial", partial);
                    }
                }

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });

            speechRecognizer.startListening(speechIntent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start speech recognition", e);
            sendJsSpeechEvent("onNativeSpeechError", e.getMessage() != null ? e.getMessage() : "unknown_error");
        }
    }

    private void stopAndroidSpeechRecognition() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.stopListening();
            } catch (Exception ignored) {}
        }
    }

    private void sendJsSpeechEvent(String functionName, String param) {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                String escaped = param.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "");
                String js = "if (window." + functionName + ") { window." + functionName + "('" + escaped + "'); }";
                this.bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }

    @Override
    public void onDestroy() {
        if (stepUpdateReceiver != null) {
            try {
                unregisterReceiver(stepUpdateReceiver);
            } catch (Exception ignored) {}
            stepUpdateReceiver = null;
        }
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        super.onDestroy();
    }
}
