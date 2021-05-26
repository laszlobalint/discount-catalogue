package com.example.nodejs.Activities.catalogueActivities;

import android.annotation.SuppressLint;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.example.nodejs.Utils.CatalogueRecycleViewAdapter;

import java.util.Calendar;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class CatalogueAddActivity extends AppCompatActivity implements CatalogueRecycleViewAdapter.ItemClickListener{
    ITSHBackend myAPI;
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    CatalogueRecycleViewAdapter adapter;
    Calendar currentDate;
    int currentDay, currentMonth, currentYear;

    @SuppressLint("DefaultLocale")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_catalogue_add);

        final EditText seller = findViewById(R.id.sellerEditText);
        final Spinner category = findViewById(R.id.categorySpinner);
        final Spinner site = findViewById(R.id.siteSpinner);
        final EditText address = findViewById(R.id.addressEditText);
        final EditText discountRate = findViewById(R.id.discountEditText);
        final TextView validFrom = findViewById(R.id.validFromEditText);
        final TextView validTill = findViewById(R.id.validTillEditText);
        final CheckBox active = findViewById(R.id.activeCheckBox);
        final EditText url = findViewById(R.id.urlEditText);
        final EditText description = findViewById(R.id.descriptionEditText);
        final Button resetFromDateButton = findViewById(R.id.resetFromDateButton);
        final Button resetTillDateButton = findViewById(R.id.resetTillDateButton);

        String[] categoriesStringArray = getResources().getStringArray(R.array.category_id_hun);

        currentDate = Calendar.getInstance();
        currentDay = currentDate.get(Calendar.DAY_OF_MONTH);
        currentMonth = currentDate.get(Calendar.MONTH) + 1;
        currentYear = currentDate.get(Calendar.YEAR);

        validFrom.setText(String.format("%d-%02d-%02d", currentYear, currentMonth, currentDay));

        validFrom.setOnClickListener(v -> {
            DatePickerDialog datePickerDialog = new DatePickerDialog(CatalogueAddActivity.this, (view, year, month, dayOfMonth) -> {
                month++;
                validFrom.setText(String.format("%d-%02d-%02d", year, month, dayOfMonth));
            }, currentYear, currentMonth, currentDay);
            datePickerDialog.show();
        });
        resetFromDateButton.setOnClickListener(v -> validFrom.setText(""));

        validTill.setText(String.format("%d-%02d-%02d", currentYear, currentMonth, currentDay));

        validTill.setOnClickListener(v -> {
            DatePickerDialog datePickerDialog1 = new DatePickerDialog(CatalogueAddActivity.this, (view, year, month, dayOfMonth) -> {
                month++;
                validTill.setText(String.format("%d-%02d-%02d", year, month, dayOfMonth));
            }, currentYear, currentMonth, currentDay);
            datePickerDialog1.show();
        });

        resetTillDateButton.setOnClickListener(v -> validTill.setText(""));

        Retrofit retrofit = RetrofitClient.getInstance();
        myAPI = retrofit.create(ITSHBackend.class);

        Button newCatalogueButton = findViewById(R.id.newCatalogueButton);
        final Button cancelCatalogue = findViewById(R.id.cancelCatalogueButton);
        final LinearLayout linearLayout = new LinearLayout(CatalogueAddActivity.this);

        // Set GUI element parameters
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        linearLayout.setHorizontalGravity(LinearLayout.TEXT_ALIGNMENT_CENTER);
        linearLayout.getDividerDrawable();

        cancelCatalogue.setOnClickListener(v -> cancelUpdate());

        newCatalogueButton.setOnClickListener(v -> {
            String selectedCategory = "";
            if (isFieldsFilled(seller, category, site, address, discountRate))
                selectedCategory = categoriesStringArray[category.getSelectedItemPosition()];
                createCatalogueItem(seller.getText().toString(), selectedCategory, site.getSelectedItem().toString(),
                         address.getText().toString(), discountRate.getText().toString(), validFrom.getText().toString(),
                        validTill.getText().toString(), active.isChecked(), url.getText().toString(), description.getText().toString());
        });
    }

    @Override
    public void onItemClick(View view, int position) {
        Toast.makeText(this, "You clicked " + adapter.getItem(position) + " on row number " + position, Toast.LENGTH_SHORT).show();
    }

    private void cancelUpdate() {
        Intent myIntent = new Intent(CatalogueAddActivity.this, DiscountCatalogueActivity.class);
        CatalogueAddActivity.this.startActivity(myIntent);
        finish();
    }

    private boolean isFieldsFilled(EditText seller, Spinner category, Spinner site, EditText address, EditText discountRate){
        if (seller.getText().toString().equals("") || category.getSelectedItem().toString().equals("") ||
                site.getSelectedItem().toString().equals("") || address.getText().toString().equals("") ||
                discountRate.getText().toString().equals("")){
            Toast.makeText(CatalogueAddActivity.this, "Fields cannot be empty!", Toast.LENGTH_LONG).show();
            return false;
        } else {
            return true;
        }
    }

    private void createCatalogueItem(final String seller, final String category, final String site, final String address, final String discountRate,
                                     final String validFrom, final String validTill, final Boolean active, final String url, final String description){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(CatalogueAddActivity.this);
        String token = settings.getString("token", "");
        String bearerToken = getString(R.string.bearer_token) + token;

                            compositeDisposable.add(myAPI.createCatalogueItem(bearerToken, seller, category, site, address, discountRate, validFrom, validTill,
                                    active, url, description)
                                    .subscribeOn(Schedulers.io())
                                    .observeOn(AndroidSchedulers.mainThread())
                                    .subscribe(response -> {
                                        if (response.code() >= 200 && response.code() < 300){
                                            Toast.makeText(CatalogueAddActivity.this, "Catalogue added successfully!", Toast.LENGTH_SHORT).show();
                                        } else {
                                            Toast.makeText(CatalogueAddActivity.this, "" + response.code(), Toast.LENGTH_SHORT).show();
                                        }
                                    }));
    }
}
