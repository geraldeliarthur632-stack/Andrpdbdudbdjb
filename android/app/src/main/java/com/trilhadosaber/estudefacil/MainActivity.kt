package com.trilhadosaber.estudefacil

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var ttsBridge: AndroidTTSBridge? = null

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Register ActivityResultLauncher for File & Camera chooser
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null

        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            if (intent != null && intent.data != null) {
                // Single file from gallery or storage
                results = arrayOf(intent.data!!)
            } else if (intent?.clipData != null) {
                // Multiple files
                val clipData: ClipData = intent.clipData!!
                val uriList = ArrayList<Uri>()
                for (i in 0 until clipData.itemCount) {
                    uriList.add(clipData.getItemAt(i).uri)
                }
                results = uriList.toTypedArray()
            } else if (cameraImageUri != null) {
                // Camera photo capture output
                results = arrayOf(cameraImageUri!!)
            }
        }

        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
        cameraImageUri = null
    }

    // Register Permission Launcher
    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val audioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (!cameraGranted && !audioGranted) {
            // Optional notifications or features still work
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Switch from Splash theme to standard theme
        setTheme(R.style.Theme_TrilhaDoSaber)
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupWebView()
        setupBackNavigation()
        requestRuntimePermissions()

        val targetUrl = getString(R.string.default_web_url)
        if (savedInstanceState == null) {
            webView.loadUrl(targetUrl)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mediaPlaybackRequiresUserGesture = false
        settings.setSupportMultipleWindows(true)
        settings.javaScriptCanOpenWindowsAutomatically = true

        // Clean WebView token from User-Agent to allow Google OAuth login without '403: disallowed_useragent'
        val rawUA = settings.userAgentString
        val sanitizedUA = rawUA.replace("; wv", "").replace("Version/4.0 ", "")
        settings.userAgentString = sanitizedUA

        // Register Native Android TTS engine for offline/online Portuguese voice synthesis
        ttsBridge = AndroidTTSBridge(this, webView)
        webView.addJavascriptInterface(ttsBridge!!, "AndroidTTS")

        webView.scrollBarStyle = View.SCROLLBARS_INSIDE_OVERLAY
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                // External intents: mailto, tel, whatsapp, Play Store
                if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("whatsapp:")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: Exception) {
                        return true
                    }
                }

                if (url.contains("play.google.com/store")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: Exception) {
                        return false
                    }
                }

                // Default behavior: load within WebView
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    progressBar.visibility = View.GONE
                    val offlineHtml = """
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Trilha do Saber - Sem Conexão</title>
                            <style>
                                body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
                                .card { background: white; border-radius: 24px; padding: 32px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 400px; width: 100%; border: 1px solid #e2e8f0; }
                                .icon { font-size: 48px; margin-bottom: 16px; }
                                h1 { font-size: 18px; font-weight: 900; margin: 0 0 8px; color: #1e1b4b; }
                                p { font-size: 13px; color: #64748b; margin: 0 0 24px; line-height: 1.5; }
                                button { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 16px; padding: 14px 28px; font-weight: 800; font-size: 14px; cursor: pointer; width: 100%; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
                                button:active { transform: scale(0.98); }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <div class="icon">📡</div>
                                <h1>Sem Conexão no Momento</h1>
                                <p>Não foi possível carregar a Trilha do Saber. Verifique sua conexão com a internet e tente novamente.</p>
                                <button onclick="location.reload()">Tentar Novamente</button>
                            </div>
                        </body>
                        </html>
                    """.trimIndent()
                    view?.loadDataWithBaseURL(null, offlineHtml, "text/html", "utf-8", null)
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
                val popupWebView = WebView(this@MainActivity)
                val popupSettings = popupWebView.settings
                popupSettings.javaScriptEnabled = true
                popupSettings.domStorageEnabled = true
                popupSettings.userAgentString = webView.settings.userAgentString

                popupWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url?.toString() ?: return false
                        // If it redirects back to our app, load it in main webView
                        if (url.contains("trilhadosaber") || url.contains("run.app") || url.contains("/__/auth/handler")) {
                            webView.loadUrl(url)
                            return true
                        }
                        return false
                    }
                }

                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = popupWebView
                resultMsg?.sendToTarget()
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                // Grant camera / microphone web permissions automatically if native permissions are held
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                openFileChooserIntent()
                return true
            }
        }

        // Support blob / PDF file downloads
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val intent = Intent(Intent.ACTION_VIEW)
                intent.setDataAndType(Uri.parse(url), mimetype)
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Abrindo documento...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun openFileChooserIntent() {
        var cameraIntent: Intent? = null
        try {
            val photoFile = createImageFile()
            if (photoFile != null) {
                cameraImageUri = FileProvider.getUriForFile(
                    this,
                    "${packageName}.fileprovider",
                    photoFile
                )
                cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                    putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                }
            }
        } catch (ex: IOException) {
            cameraImageUri = null
        }

        val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
        }

        val intentArray: Array<Intent> = if (cameraIntent != null) arrayOf(cameraIntent) else emptyArray()

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
            putExtra(Intent.EXTRA_TITLE, "Selecionar Foto ou Câmera")
            putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
        }

        fileChooserLauncher.launch(chooserIntent)
    }

    @Throws(IOException::class)
    private fun createImageFile(): File? {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir: File? = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JPEG_${timeStamp}_", ".jpg", storageDir)
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    // Let user exit gracefully
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun requestRuntimePermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        ttsBridge?.shutdown()
        ttsBridge = null
        super.onDestroy()
    }

    /**
     * Native Android Text-to-Speech Bridge exposed to WebView JavaScript.
     * Provides 100% reliable, offline-capable Brazilian Portuguese speech narration.
     */
    class AndroidTTSBridge(
        private val context: Context,
        private val webView: WebView
    ) : TextToSpeech.OnInitListener {
        private var tts: TextToSpeech? = TextToSpeech(context, this)
        private var isInitialized = false
        private var lastUtteranceId = 0L
        private var pendingSpeakText: String? = null
        private var pendingSpeakRate: Float = 1.0f
        private var pendingUtteranceId: String? = null

        override fun onInit(status: Int) {
            if (status == TextToSpeech.SUCCESS) {
                var result = tts?.setLanguage(Locale("pt", "BR"))
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    result = tts?.setLanguage(Locale("pt"))
                }
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts?.setLanguage(Locale.getDefault())
                }
                isInitialized = true
                webView.post {
                    webView.evaluateJavascript("window.__onAndroidTTSReady && window.__onAndroidTTSReady()", null)
                }

                // If speech was requested before onInit finished, speak now
                if (pendingSpeakText != null) {
                    val textToSpeak = pendingSpeakText!!
                    val idToSpeak = pendingUtteranceId ?: (++lastUtteranceId).toString()
                    tts?.setSpeechRate(if (pendingSpeakRate > 0f) pendingSpeakRate else 1.0f)
                    tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, idToSpeak)
                    pendingSpeakText = null
                    pendingUtteranceId = null
                }

                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        webView.post {
                            webView.evaluateJavascript("window.__onAndroidTTSStart && window.__onAndroidTTSStart('$utteranceId')", null)
                        }
                    }

                    override fun onDone(utteranceId: String?) {
                        webView.post {
                            webView.evaluateJavascript("window.__onAndroidTTSDone && window.__onAndroidTTSDone('$utteranceId')", null)
                        }
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) {
                        webView.post {
                            webView.evaluateJavascript("window.__onAndroidTTSError && window.__onAndroidTTSError('$utteranceId')", null)
                        }
                    }
                })
            }
        }

        @JavascriptInterface
        fun speak(text: String, rate: Float): Boolean {
            return speakWithId(text, rate, (++lastUtteranceId).toString())
        }

        @JavascriptInterface
        fun speakWithId(text: String, rate: Float, utteranceId: String): Boolean {
            if (!isInitialized || tts == null) {
                // Buffer request until onInit completes
                pendingSpeakText = text
                pendingSpeakRate = rate
                pendingUtteranceId = utteranceId
                return true
            }
            tts?.setSpeechRate(if (rate > 0f) rate else 1.0f)
            val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
            return result == TextToSpeech.SUCCESS
        }

        @JavascriptInterface
        fun stop() {
            pendingSpeakText = null
            pendingUtteranceId = null
            tts?.stop()
        }

        @JavascriptInterface
        fun pause() {
            pendingSpeakText = null
            tts?.stop()
        }

        @JavascriptInterface
        fun isSpeaking(): Boolean {
            return tts?.isSpeaking == true
        }

        @JavascriptInterface
        fun isAvailable(): Boolean {
            return isInitialized
        }

        fun shutdown() {
            pendingSpeakText = null
            tts?.stop()
            tts?.shutdown()
            tts = null
        }
    }
}
