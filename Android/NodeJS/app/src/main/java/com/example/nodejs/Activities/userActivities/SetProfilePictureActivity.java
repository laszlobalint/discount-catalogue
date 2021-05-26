package com.example.nodejs.Activities.userActivities;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.FileProvider;
import android.support.v7.app.AppCompatActivity;
import android.webkit.MimeTypeMap;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import com.example.nodejs.Utils.PathUtils;
import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.example.nodejs.Model.User;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import de.hdodenhof.circleimageview.CircleImageView;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Retrofit;

public class SetProfilePictureActivity extends AppCompatActivity {
    private static final int CAMERA_REQUEST = 1888;
    private static final int CAMERA_PERMISSION_CODE = 100;
    private static final int PICK_IMAGE = 1;
    private static final String IMAGE_TYPE = "image/*";
    private static final String FILE_NAME = "profile_pic.jpg";
    private String currentPhotoPath;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_set_profile_picture);

        CircleImageView profilePictureImageView = findViewById(R.id.profilePictureImageView);
        ImageView removeImageView = findViewById(R.id.removeImageView);
        Button browsePhotoButton = findViewById(R.id.browsePhotoButton);
        Button cameraPhotoButton = findViewById(R.id.cameraPhotoButton);
        Button cancelPictureUpdateButton = findViewById(R.id.cancelPictureUpdateButton);

        isStoragePermissionGranted();

        profilePictureImageView.setImageBitmap(loadImageFromStorage(getApplicationContext()));

        removeImageView.setOnClickListener(v -> {
            removeProfilePicture();
            profilePictureImageView.setImageBitmap(BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile));
            new File(getApplicationContext().getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), FILE_NAME).delete();
        });

        browsePhotoButton.setOnClickListener(v -> {
            Intent getIntent = new Intent(Intent.ACTION_GET_CONTENT);
            getIntent.setType(IMAGE_TYPE);

            Intent pickIntent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            pickIntent.setType(IMAGE_TYPE);

            Intent chooserIntent = Intent.createChooser(getIntent, "Select an image");
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[] {pickIntent});

            startActivityForResult(chooserIntent, PICK_IMAGE);
        });

        cameraPhotoButton.setOnClickListener(v -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
            }
            else {
                dispatchTakePictureIntent();
            }
        });

        cancelPictureUpdateButton.setOnClickListener(v -> finish());
    }

    @Override
    public void onRequestPermissionsResult ( int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "camera permission granted", Toast.LENGTH_LONG).show();
                Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                startActivityForResult(cameraIntent, CAMERA_REQUEST);
            } else {
                Toast.makeText(this, "camera permission denied", Toast.LENGTH_LONG).show();
            }
        } else if (requestCode == 1) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED){
                Toast.makeText(this, "Storage permission granted", Toast.LENGTH_LONG).show();
                findViewById(R.id.browsePhotoButton).setEnabled(true);
            } else {
                Toast.makeText(this, "Camera permission denied!", Toast.LENGTH_LONG).show();
                findViewById(R.id.browsePhotoButton).setEnabled(false);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SetProfilePictureActivity.this);
        String token = settings.getString("token", "");
        String bearerToken = getString(R.string.bearer_token) + token;

        CircleImageView profilePictureImageView = findViewById(R.id.profilePictureImageView);
        File profilePicFile = new File(this.getCacheDir(), "cameraPhoto.jpg");

        try {
            profilePicFile.createNewFile();
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (requestCode == PICK_IMAGE && resultCode == Activity.RESULT_OK) {
            profilePicFile = new File(PathUtils.getPath(this, data.getData()));

        } else if (requestCode == CAMERA_REQUEST && resultCode == Activity.RESULT_OK) {
            Bitmap photo = getBitmapFromFile(new File(currentPhotoPath));
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            photo.compress(Bitmap.CompressFormat.JPEG, 90 /*ignored for PNG*/, bos);
            byte[] photoData = bos.toByteArray();

            try {
                FileOutputStream fos = new FileOutputStream(profilePicFile);
                fos.write(photoData);
                fos.flush();
                fos.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Bitmap profilePicBitmap;

        if (resultCode == Activity.RESULT_OK && isPictureExtensionAllowed(profilePicFile)) {
            profilePicBitmap = getBitmapFromFile(profilePicFile);
            saveToInternalStorage(profilePicBitmap);
            uploadProfilePic(bearerToken, profilePicFile);
            profilePictureImageView.setImageBitmap(profilePicBitmap);
        }
    }

    private Bitmap loadImageFromStorage(Context context) {
        Bitmap profilePicBitmap = BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile);

        File f = new File(context.getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), FILE_NAME);

        if (f.exists()){
            profilePicBitmap = getBitmapFromFile(f);
        }

        return profilePicBitmap;
    }

    private void saveToInternalStorage(Bitmap bitmapImage){
        File directory = getApplicationContext().getDir(getResources().getString(R.string.app_name), MODE_PRIVATE);

        File myPath = new File(directory,FILE_NAME);

        FileOutputStream fileOutputStream = null;
        try {
            fileOutputStream = new FileOutputStream(myPath);
            bitmapImage.compress(Bitmap.CompressFormat.PNG, 90, fileOutputStream);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                fileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void uploadProfilePic(String token, File profilePic) {
        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SetProfilePictureActivity.this);

        RequestBody profilePicToSend = RequestBody.create(MediaType.parse(getMimeType(profilePic.getPath())), profilePic);

        compositeDisposable.add(myAPI.uploadProfilePicture(token, profilePicToSend)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        User.storeTokenIfChanged(this, settings.getString("token", "not found"), response.headers().get("Authorization"));
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.body().string(), Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }

    private void removeProfilePicture(){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SetProfilePictureActivity.this);
        String bearerToken = getString(R.string.bearer_token) + settings.getString("token", "");

        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();

        compositeDisposable.add(myAPI.removeProfilePicture(bearerToken)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        User.storeTokenIfChanged(this, settings.getString("token", "not found"), response.headers().get("Authorization"));
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.body().string(), Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }

    public static String getMimeType(String url) {
        String type = null;
        String extension = MimeTypeMap.getFileExtensionFromUrl(url);
        if (extension != null) {
            type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
        }
        return type;
    }

    public boolean isPictureExtensionAllowed(File profilePicFile) {
        String extension = profilePicFile.getPath().substring(profilePicFile.getPath().lastIndexOf("."));
        switch (extension) {
            case ".jpg":
            case ".gif":
            case ".jpeg":
            case ".png":
                return true;
            default:
                Toast.makeText(SetProfilePictureActivity.this, getString(R.string.supported_profice_pic_types), Toast.LENGTH_LONG).show();
                return false;
        }
    }

    public boolean isStoragePermissionGranted() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED) {
                return true;
            } else {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
                return false;
            }
        } else {
            return true;
        }
    }
    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File image = File.createTempFile(
                imageFileName,
                ".jpg",
                storageDir
        );

        currentPhotoPath = image.getAbsolutePath();
        return image;
    }

    private void dispatchTakePictureIntent() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            File photoFile = null;
            try {
                photoFile = createImageFile();
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            if (photoFile != null) {
                Uri photoURI = FileProvider.getUriForFile(this, "com.example.android.fileprovider", photoFile);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                startActivityForResult(takePictureIntent, CAMERA_REQUEST);
            }
        }
    }

    public static Bitmap getBitmapFromFile(final File imageFile) {
        Bitmap photoBitmap = BitmapFactory.decodeFile(imageFile.getPath());
        ByteArrayOutputStream stream = new ByteArrayOutputStream();

        int imageRotation = getImageRotation(imageFile);

        if (imageRotation != 0)
            photoBitmap = getBitmapRotatedByDegree(photoBitmap, imageRotation);

        photoBitmap.compress(Bitmap.CompressFormat.JPEG, 70, stream);

        return photoBitmap;
    }

    private static int getImageRotation(final File imageFile) {
        ExifInterface exif = null;
        int exifRotation = 0;

        try {
            exif = new ExifInterface(imageFile.getPath());
            exifRotation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (exif == null)
            return 0;
        else
            return exifToDegrees(exifRotation);
    }

    private static int exifToDegrees(int rotation) {
        if (rotation == ExifInterface.ORIENTATION_ROTATE_90)
            return 90;
        else if (rotation == ExifInterface.ORIENTATION_ROTATE_180)
            return 180;
        else if (rotation == ExifInterface.ORIENTATION_ROTATE_270)
            return 270;

        return 0;
    }

    private static Bitmap getBitmapRotatedByDegree(Bitmap bitmap, int rotationDegree) {
        Matrix matrix = new Matrix();
        matrix.preRotate(rotationDegree);

        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
    }
}
