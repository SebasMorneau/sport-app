package com.sportapp;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends Activity {
    private int score = 0;
    private TextView scoreText;
    private Button addButton;
    private Button resetButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        scoreText = findViewById(R.id.scoreText);
        addButton = findViewById(R.id.addButton);
        resetButton = findViewById(R.id.resetButton);

        updateScore();

        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                score++;
                updateScore();
            }
        });

        resetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                score = 0;
                updateScore();
            }
        });
    }

    private void updateScore() {
        scoreText.setText(String.valueOf(score));
    }
}