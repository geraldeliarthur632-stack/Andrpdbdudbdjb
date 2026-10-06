# ProGuard rules for Trilha do Saber (com.trilhadosaber.estudefacil)
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.trilhadosaber.estudefacil.** { *; }
-dontwarn androidx.webkit.**
