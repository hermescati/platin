package dev.platin.glass

import android.graphics.Color
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GlassModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PlatinGlass")

    View(GlassBackdropView::class) {
      Name("PlatinGlassBackdropView")

      Prop("group") { view: GlassBackdropView, group: String? ->
        view.group = group ?: GlassRegistry.DEFAULT_GROUP
      }

      Prop("offscreen") { view: GlassBackdropView, value: Boolean? -> view.offscreen = value ?: false }
    }

    View(GlassView::class) {
      Name("PlatinGlassView")

      Prop("group") { view: GlassView, group: String? ->
        view.group = group ?: GlassRegistry.DEFAULT_GROUP
      }

      Prop("underlay") { view: GlassView, underlay: String? -> view.underlay = underlay }
      Prop("overlay") { view: GlassView, overlay: String? -> view.overlay = overlay }

      Prop("shapes") { view: GlassView, value: FloatArray? -> view.shapes = value }
      Prop("inset") { view: GlassView, value: Float? -> view.inset = value ?: 0f }
      Prop("cornerRadius") { view: GlassView, value: Float? -> view.cornerRadius = value ?: 0f }
      Prop("blend") { view: GlassView, value: Float? -> view.blend = value ?: 0f }
      Prop("blurRadius") { view: GlassView, value: Float? -> view.blurRadius = value ?: 0f }
      Prop("bezel") { view: GlassView, value: Float? -> view.bezel = value ?: 0f }
      Prop("refraction") { view: GlassView, value: Float? -> view.refraction = value ?: 0f }
      Prop("refractOutward") { view: GlassView, value: Boolean? -> view.refractOutward = value ?: false }
      Prop("refractionYScale") { view: GlassView, value: Float? -> view.refractionYScale = value ?: 1f }
      Prop("refractOutwardY") { view: GlassView, value: Boolean? -> view.refractOutwardY = value }
      Prop("falloff") { view: GlassView, value: Float? -> view.falloff = value ?: 0f }
      Prop("dispersion") { view: GlassView, value: Float? -> view.dispersion = value ?: 0f }
      Prop("magnify") { view: GlassView, value: Float? -> view.magnify = value ?: 0f }
      Prop("saturation") { view: GlassView, value: Float? -> view.saturation = value ?: 1f }
      Prop("adaptive") { view: GlassView, value: Float? -> view.adaptive = value ?: 0f }
      Prop("dim") { view: GlassView, value: Float? -> view.dim = value ?: 0f }
      Prop("lightAngle") { view: GlassView, value: Float? -> view.lightAngle = value ?: 30f }
      Prop("specular") { view: GlassView, value: Float? -> view.specular = value ?: 0f }
      Prop("highlightWidth") { view: GlassView, value: Float? -> view.highlightWidth = value ?: 2f }
      Prop("edgeSharp") { view: GlassView, value: Float? -> view.edgeSharp = value ?: 0f }
      Prop("edgeSoft") { view: GlassView, value: Float? -> view.edgeSoft = value ?: 0f }
      Prop("sharpWidth") { view: GlassView, value: Float? -> view.sharpWidth = value ?: 0f }
      Prop("softWidth") { view: GlassView, value: Float? -> view.softWidth = value ?: 0f }
      Prop("glowX") { view: GlassView, value: Float? -> view.glowX = value ?: 0f }
      Prop("glowY") { view: GlassView, value: Float? -> view.glowY = value ?: 0f }
      Prop("glowSpread") { view: GlassView, value: Float? -> view.glowSpread = value ?: 0f }
      Prop("glowStrength") { view: GlassView, value: Float? -> view.glowStrength = value ?: 0f }
      Prop("shadowRadius") { view: GlassView, value: Float? -> view.shadowRadius = value ?: 0f }
      Prop("shadowOffset") { view: GlassView, value: Float? -> view.shadowOffset = value ?: 0f }
      Prop("pinch") { view: GlassView, value: Float? -> view.pinch = value ?: 0f }
      Prop("pinchWidth") { view: GlassView, value: Float? -> view.pinchWidth = value ?: 0f }
      Prop("pinchSpread") { view: GlassView, value: Float? -> view.pinchSpread = value ?: 0f }
      Prop("rimPrism") { view: GlassView, value: Float? -> view.rimPrism = value ?: 0f }
      Prop("pinchLeft") { view: GlassView, value: Float? -> view.pinchLeft = value ?: 0f }
      Prop("pinchRight") { view: GlassView, value: Float? -> view.pinchRight = value ?: 0f }
      Prop("sampleMaxX") { view: GlassView, value: Float? -> view.sampleMaxX = value ?: 0f }
      Prop("ellipse") { view: GlassView, value: Float? -> view.ellipse = value ?: 0f }
      Prop("clipLeft") { view: GlassView, value: Float? -> view.clipLeft = value ?: 0f }
      Prop("clipTop") { view: GlassView, value: Float? -> view.clipTop = value ?: 0f }
      Prop("clipRight") { view: GlassView, value: Float? -> view.clipRight = value ?: 0f }
      Prop("clipBottom") { view: GlassView, value: Float? -> view.clipBottom = value ?: 0f }
      Prop("clipScaleX") { view: GlassView, value: Float? -> view.clipScaleX = value ?: 1f }
      Prop("clipScaleY") { view: GlassView, value: Float? -> view.clipScaleY = value ?: 1f }
      Prop("clipSoft") { view: GlassView, value: Float? -> view.clipSoft = value ?: 0f }
      Prop("clipOn") { view: GlassView, value: Float? -> view.clipOn = value ?: 0f }
      Prop("tint") { view: GlassView, value: Color? -> view.tint = value ?: TRANSPARENT }
      Prop("rim") { view: GlassView, value: Color? -> view.rim = value ?: TRANSPARENT }
      Prop("fallback") { view: GlassView, value: Color? -> view.fallback = value ?: TRANSPARENT }
      Prop("shadow") { view: GlassView, value: Color? -> view.shadow = value ?: TRANSPARENT }

      OnViewDidUpdateProps { view: GlassView ->
        view.updateEffect()
      }
    }
  }

  private companion object {
    val TRANSPARENT: Color = Color.valueOf(0f, 0f, 0f, 0f)
  }
}
