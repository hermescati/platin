package dev.platin.glass

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.RenderNode
import android.os.Build
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class GlassBackdropView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  internal val node: RenderNode? =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) RenderNode("PlatinGlassBackdrop") else null

  var group: String = GlassRegistry.DEFAULT_GROUP
    set(value) {
      if (value == field) return
      GlassRegistry.unregister(field, this)
      field = value
      if (isAttachedToWindow) GlassRegistry.register(value, this)
    }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    GlassRegistry.register(group, this)
  }

  override fun onDetachedFromWindow() {
    GlassRegistry.unregister(group, this)
    super.onDetachedFromWindow()
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) = Unit

  @SuppressLint("MissingSuperCall")
  override fun requestLayout() = Unit

  override fun dispatchDraw(canvas: Canvas) {
    val recorder = node
    if (recorder == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || !canvas.isHardwareAccelerated) {
      super.dispatchDraw(canvas)
      return
    }
    recorder.setPosition(0, 0, width, height)
    val recording = recorder.beginRecording(width, height)
    try {
      super.dispatchDraw(recording)
    } finally {
      recorder.endRecording()
    }
    canvas.drawRenderNode(recorder)
  }
}
