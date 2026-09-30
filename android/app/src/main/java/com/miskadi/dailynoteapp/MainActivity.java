package com.miskadi.dailynoteapp;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
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
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "DailyNoteMainActivity";
    private static final int PERMISSION_REQ_CODE = 1002;
    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestAppPermissions();
        setupNativeSpeechBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        requestAppPermissions();
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

            if (!permissionsToRequest.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[0]), PERMISSION_REQ_CODE);
            }
        }
    }

    private void setupNativeSpeechBridge() {
        mainHandler.post(() -> {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

                // Add Javascript interface for ultra-fast, robust native Android speech recognition
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

            // Handle language format: "gu-IN", "hi-IN", "en-IN", etc.
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
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        super.onDestroy();
    }
}
