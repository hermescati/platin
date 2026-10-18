package dev.questlog.glass

import android.graphics.Color
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GlassModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("QuestlogGlass")

    View(GlassBackdropView::class) {
      Name("QuestlogGlassBackdropView")

      Prop("group") { view: GlassBackdropView, group: String? ->
        view.group = group ?: GlassRegistry.DEFAULT_GROUP
      }
    }

    View(GlassView::class) {
      Name("QuestlogGlassView")

      Prop("group") { view: GlassView, group: String? ->
        view.group = group ?: GlassRegistry.DEFAULT_GROUP
      }

      Prop("shapes") { view: GlassView, value: FloatArray? -> view.shapes = value }
      Prop("inset") { view: GlassView, value: Float? -> view.inset = value ?: 0f }
      Prop("cornerRadius") { view: GlassView, value: Float? -> view.cornerRadius = value ?: 0f }
      Prop("blend") { view: GlassView, value: Float? -> view.blend = value ?: 0f }
      Prop("blurRadius") { view: GlassView, value: Float? -> view.blurRadius = value ?: 0f }
      Prop("bezel") { view: GlassView, value: Float? -> view.bezel = value ?: 0f }
      Prop("refraction") { view: GlassView, value: Float? -> view.refraction = value ?: 0f }
      Prop("magnify") { view: GlassView, value: Float? -> view.magnify = value ?: 0f }
      Prop("glowRadius") { view: GlassView, value: Float? -> view.glowRadius = value ?: 0f }
      Prop("rimWidth") { view: GlassView, value: Float? -> view.rimWidth = value ?: 0f }
      Prop("shadowRadius") { view: GlassView, value: Float? -> view.shadowRadius = value ?: 0f }
      Prop("shadowOffset") { view: GlassView, value: Float? -> view.shadowOffset = value ?: 0f }
      Prop("tint") { view: GlassView, value: Color? -> view.tint = value ?: TRANSPARENT }
      Prop("sheen") { view: GlassView, value: Color? -> view.sheen = value ?: TRANSPARENT }
      Prop("rimTop") { view: GlassView, value: Color? -> view.rimTop = value ?: TRANSPARENT }
      Prop("rimBottom") { view: GlassView, value: Color? -> view.rimBottom = value ?: TRANSPARENT }
      Prop("glow") { view: GlassView, value: Color? -> view.glow = value ?: TRANSPARENT }
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
