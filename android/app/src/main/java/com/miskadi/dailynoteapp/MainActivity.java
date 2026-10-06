package com.miskadi.dailynoteapp;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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

    private static final String PREFS_NAME = "DailyNoteStepPrefs";
    private static final String PREF_BASELINE_STEPS = "baseline_steps";
    private static final String PREF_BASELINE_DATE = "baseline_date";
    private static final String PREF_TODAY_STEPS = "today_steps";

    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private SharedPreferences stepPrefs;
    private int currentTodaySteps = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestAppPermissions();
        setupStepSensors();
        setupNativeSpeechBridge();
        setupNativeStepBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
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
            Log.d(TAG, "Permissions granted/handled, auto-starting step sensors and syncing steps immediately");
            setupStepSensors();
            registerStepSensors();
            syncHardwareStepsWithJs();
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
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.ACTIVITY_RECOGNITION);
                }
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
            registerStepSensors();
        }
    }

    private void registerStepSensors() {
        if (sensorManager != null) {
            if (stepCounterSensor != null) {
                sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
                Log.d(TAG, "Hardware STEP_COUNTER registered successfully");
            }
            if (stepDetectorSensor != null) {
                sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
                Log.d(TAG, "Hardware STEP_DETECTOR registered successfully");
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

            // If day changed, or no baseline, or device rebooted (hardware counter < baseline)
            if (!todayDate.equals(savedDate) || baseline <= 0 || totalHardwareSteps < baseline) {
                baseline = totalHardwareSteps;
                stepPrefs.edit()
                    .putString(PREF_BASELINE_DATE, todayDate)
                    .putInt(PREF_BASELINE_STEPS, baseline)
                    .putInt(PREF_TODAY_STEPS, 0)
                    .apply();
                currentTodaySteps = 0;
            } else {
                currentTodaySteps = totalHardwareSteps - baseline;
                stepPrefs.edit().putInt(PREF_TODAY_STEPS, currentTodaySteps).apply();
            }

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
            if (saved > 0) {
                sendJsStepUpdate(saved);
            }
        }
    }

    private void setupNativeStepBridge() {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public boolean isHardwareStepSupported() {
                        return stepCounterSensor != null || stepDetectorSensor != null;
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
