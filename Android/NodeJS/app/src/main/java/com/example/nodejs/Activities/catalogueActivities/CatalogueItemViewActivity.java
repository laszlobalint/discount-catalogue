package com.example.nodejs.Activities.catalogueActivities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Address;
import android.location.Geocoder;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.nodejs.Model.Catalogue;
import com.example.nodejs.R;
import com.example.nodejs.Model.User;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class CatalogueItemViewActivity extends AppCompatActivity implements OnMapReadyCallback {
    ITSHBackend myAPI;
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    Gson gson = new GsonBuilder().setLenient().create();
    private MapView mapView;
    private GoogleMap gmap;
    private static final String MAP_VIEW_BUNDLE_KEY = "MapViewBundleKey";
    String address;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_catalogue_item_view);

        Retrofit retrofit = RetrofitClient.getInstance();
        myAPI = retrofit.create(ITSHBackend.class);

        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(CatalogueItemViewActivity.this);
        final Catalogue catalogue = gson.fromJson(settings.getString("catalogue","{}"), Catalogue.class);
        String token = settings.getString("token", " ");
        User user = gson.fromJson(settings.getString("user", "{}"), User.class);

        TextView sellerTextView = findViewById(R.id.sellerTextView);
        TextView categoryTextView = findViewById(R.id.categoryTextView);
        TextView siteTextView = findViewById(R.id.siteTextView);
        TextView addressTextView = findViewById(R.id.addressTextView);
        TextView discountTextView = findViewById(R.id.discountTextView);
        TextView urlTextView = findViewById(R.id.urlTextView);
        TextView descriptionTextView = findViewById(R.id.descriptionTextView);
        Button deactivateCatalogueItemButton = findViewById(R.id.deactivateCatalogueItemButton);
        Button cancelCatalogueItemButton = findViewById(R.id.cancelCatalogueItemButton);
        Button openAttachmentButton = findViewById(R.id.openAttachmentButton);

        sellerTextView.setText(catalogue.getSeller());
        categoryTextView.setText(catalogue.getCategory_id());
        siteTextView.setText(catalogue.getSite_id());
        addressTextView.setText(catalogue.getAddress());
        discountTextView.setText(catalogue.getDiscount_rate());
        urlTextView.setText(catalogue.getUrl());
        descriptionTextView.setText(catalogue.getDescription());

        address = catalogue.getAddress();

        if (user.getIs_admin() == 0){
            deactivateCatalogueItemButton.setEnabled(false);
            deactivateCatalogueItemButton.setVisibility(View.INVISIBLE);
        }

        if (catalogue.getAttachment_file_name() == null){
            openAttachmentButton.setEnabled(false);
            openAttachmentButton.setVisibility(View.INVISIBLE);
        }

        openAttachmentButton.setOnClickListener(v -> openAttachment(catalogue));

        deactivateCatalogueItemButton.setOnClickListener(v -> deactivateCatalogueItem(catalogue, token));

        cancelCatalogueItemButton.setOnClickListener(v -> finish());

        Bundle mapViewBundle = null;
        if (savedInstanceState != null) {
            mapViewBundle = savedInstanceState.getBundle(MAP_VIEW_BUNDLE_KEY);
        }

        mapView = findViewById(R.id.mapView);
        mapView.onCreate(mapViewBundle);
        mapView.getMapAsync(this);
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);

        Bundle mapViewBundle = outState.getBundle(MAP_VIEW_BUNDLE_KEY);
        if (mapViewBundle == null) {
            mapViewBundle = new Bundle();
            outState.putBundle(MAP_VIEW_BUNDLE_KEY, mapViewBundle);
        }

        mapView.onSaveInstanceState(mapViewBundle);
    }

    @Override
    protected void onStart() {
        super.onStart();
        mapView.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        mapView.onPause();
        super.onPause();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        mapView.onLowMemory();
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        gmap = googleMap;
        gmap.setMinZoomPreference(12);
        LatLng location = getLatLongFromAddress(address);
        MarkerOptions markerOptions = new MarkerOptions();
        markerOptions.position(location);
        gmap.addMarker(markerOptions);
        gmap.getUiSettings().setScrollGesturesEnabled(false);
        gmap.moveCamera(CameraUpdateFactory.newLatLng(location));
        gmap.animateCamera(CameraUpdateFactory.zoomTo(15.0f));
    }

    @Override
    protected void onStop() {
        super.onStop();
        mapView.onStop();
    }

    @Override
    protected void onDestroy() {
        mapView.onDestroy();
        super.onDestroy();
    }

    private LatLng getLatLongFromAddress(String address) {
        double lat = 0.0, lng = 0.0;
        Geocoder geoCoder = new Geocoder(this, Locale.getDefault());

        try {
            List<Address> addressList = geoCoder.getFromLocationName(address, 1);
            if (addressList.size() > 0) {
                lat = addressList.get(0).getLatitude();
                lng = addressList.get(0).getLongitude();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return new LatLng(lat, lng);
    }

    public void deactivateCatalogueItem(Catalogue catalogue, String token){
        String bearerToken = "Bearer" + " " + token;

        compositeDisposable.add(myAPI.deleteCatalogueItem(bearerToken, catalogue.getId())
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if(response.code() >= 200 && response.code() < 300) {
                        Toast.makeText(CatalogueItemViewActivity.this, "Catalogue item successfully deactivated" , Toast.LENGTH_LONG).show();
                        finish();
                    } else {
                        Toast.makeText(CatalogueItemViewActivity.this,  response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }

    public void openAttachment(Catalogue catalogue){
            String url = "http://10.0.2.2:3000/attachments/" + catalogue.getAttachment_file_name();
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setData(Uri.parse(url));
            startActivity(i);
    }
}
