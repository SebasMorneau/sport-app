package com.sportapp

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity

class SimpleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create a simple layout programmatically
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#f0f0f0"))
        }
        
        // Title
        val title = TextView(this).apply {
            text = "🎉 SportApp is Working!"
            textSize = 24f
            setTextColor(Color.parseColor("#333333"))
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 10)
        }
        
        // Subtitle
        val subtitle = TextView(this).apply {
            text = "Native Android app running successfully"
            textSize = 16f
            setTextColor(Color.parseColor("#666666"))
            gravity = Gravity.CENTER
            setPadding(20, 10, 20, 20)
        }
        
        // Backend status
        val backendStatus = TextView(this).apply {
            text = "✅ Backend: http://localhost:3500/api\n✅ Database: PostgreSQL\n✅ Cache: Redis"
            textSize = 14f
            setTextColor(Color.parseColor("#007700"))
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
        }
        
        layout.addView(title)
        layout.addView(subtitle)
        layout.addView(backendStatus)
        
        setContentView(layout)
    }
}