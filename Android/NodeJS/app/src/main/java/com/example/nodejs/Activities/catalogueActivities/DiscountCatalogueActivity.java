package com.example.nodejs.Activities.catalogueActivities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;

import com.example.nodejs.Utils.NavigationDrawer;
import com.example.nodejs.R;
import com.example.nodejs.Model.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.mikepenz.materialdrawer.Drawer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class DiscountCatalogueActivity extends AppCompatActivity {
    Gson gson = new GsonBuilder().setLenient().create();
    Bitmap profilePicBitmap = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_discount_catalogue);

        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(DiscountCatalogueActivity.this);
        final User user = gson.fromJson(settings.getString("user","{}"), User.class);
        final String token = settings.getString("token","{}");

        profilePicBitmap = BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile);
        loadImageFromStorage(getApplicationContext());
        Drawable profilePic = new BitmapDrawable(getResources(), profilePicBitmap);

        Drawer drawer = new NavigationDrawer(this, profilePic, user, token).createNavigationDrawer();

        Button catalogueButton = findViewById(R.id.catalogueButton);
        Button newCatalogueButton = findViewById(R.id.newCatalogueButton);
        ImageView hamburgerImageView = findViewById(R.id.hamburgerImageView);

        hamburgerImageView.setOnClickListener(v -> drawer.openDrawer());

        catalogueButton.setOnClickListener(v -> startCatalogueActivity());

        if (user.getIs_admin() != 1) {
            newCatalogueButton.setVisibility(View.INVISIBLE);
            newCatalogueButton.setEnabled(false);
        }

        newCatalogueButton.setOnClickListener(v -> startCatalogueAddActivity());
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    private void loadImageFromStorage(Context context) {
        try {
            File file = new File(context.getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg");
            profilePicBitmap = BitmapFactory.decodeStream(new FileInputStream(file));
        }
        catch (FileNotFoundException e)
        {
            e.printStackTrace();
        }
    }

    private void startCatalogueActivity(){
        Intent myIntent = new Intent(DiscountCatalogueActivity.this, CatalogueActivity.class);
        DiscountCatalogueActivity.this.startActivity(myIntent);
        finish();
    }

    private void startCatalogueAddActivity(){
        Intent myIntent = new Intent(DiscountCatalogueActivity.this, CatalogueAddActivity.class);
        DiscountCatalogueActivity.this.startActivity(myIntent);
        finish();
    }
}