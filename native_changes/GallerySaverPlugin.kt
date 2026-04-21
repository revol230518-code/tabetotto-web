
package com.revo.tabetotto

import android.content.ContentValues
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.OutputStream

@CapacitorPlugin(name = "GallerySaver")
class GallerySaverPlugin : Plugin() {

    @PluginMethod
    fun saveImage(call: PluginCall) {
        val base64 = call.getString("base64")
        val fileName = call.getString("fileName") ?: "image_${System.currentTimeMillis()}.jpg"
        val album = call.getString("album") ?: "Tabetotto"

        if (base64 == null) {
            call.reject("No base64 data provided")
            return
        }

        try {
            // Base64デコード
            val decodedBytes = Base64.decode(base64, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)

            if (bitmap == null) {
                call.reject("Failed to decode bitmap")
                return
            }

            // ギャラリー保存処理
            val savedUri = saveBitmapToGallery(bitmap, fileName, album)
            if (savedUri != null) {
                val ret = JSObject()
                ret.put("saved", true)
                ret.put("uri", savedUri)
                call.resolve(ret)
            } else {
                call.reject("Failed to save image to gallery")
            }
        } catch (e: Exception) {
            call.reject("Error saving image: ${e.message}")
        }
    }

    private fun saveBitmapToGallery(bitmap: Bitmap, fileName: String, albumName: String): String? {
        var outputStream: OutputStream? = null
        return try {
            val contentResolver = context.contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // Android 10以上: Pictures/AlbumName に保存
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/" + albumName)
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val imageUri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
            if (imageUri != null) {
                outputStream = contentResolver.openOutputStream(imageUri)
                if (outputStream != null) {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
                    outputStream.close()
                    
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        contentValues.clear()
                        contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                        contentResolver.update(imageUri, contentValues, null, null)
                    }
                    return imageUri.toString()
                }
            }
            null
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            outputStream?.close()
        }
    }
}
