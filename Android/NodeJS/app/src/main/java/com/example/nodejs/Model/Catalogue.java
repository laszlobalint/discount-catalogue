package com.example.nodejs.Model;

import android.os.Parcel;
import android.os.Parcelable;

public class Catalogue implements Parcelable  {
    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(id);
        dest.writeString(seller);
        dest.writeString(category_id);
        dest.writeString(site_id);
        dest.writeString(address);
        dest.writeString(discount_rate);
        dest.writeString(valid_from);
        dest.writeString(valid_till);
        dest.writeInt(active);
        dest.writeString(url);
        dest.writeString(description);
        dest.writeString(attachment_file_name);
    }

    private Catalogue(Parcel in) {
        id = in.readInt();
        seller = in.readString();
        category_id = in.readString();
        site_id = in.readString();
        address = in.readString();
        discount_rate = in.readString();
        valid_from = in.readString();
        valid_till = in.readString();
        active = in.readInt();
        url = in.readString();
        description = in.readString();
        attachment_file_name = in.readString();
    }
    public static final Parcelable.Creator<Catalogue> CREATOR = new Parcelable.Creator<Catalogue>() {
        public Catalogue createFromParcel(Parcel in) {
            return new Catalogue(in);
        }

        public Catalogue[] newArray(int size) {
            return new Catalogue[size];
        }
    };

    private Integer id;
    private String seller;
    private String category_id;
    private String site_id;
    private String address;
    private String discount_rate;
    private String valid_from;
    private String valid_till;
    private int active;
    private String url;
    private String description;
    private String attachment_file_name;

    public Integer getId() { return id; }

    public void setId(Integer id) { this.id = id; }

    public String getSeller() {
        return seller;
    }

    public void setSeller(String seller) {
        this.seller = seller;
    }

    public String getCategory_id() {
        return category_id;
    }

    public void setCategory_id(String category_id) {
        this.category_id = category_id;
    }

    public String getSite_id() {
        return site_id;
    }

    public void setSite_id(String site_id) {
        this.site_id = site_id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDiscount_rate() {
        return discount_rate;
    }

    public void setDiscount_rate(String discount_rate) {
        this.discount_rate = discount_rate;
    }

    public String getValid_from() {
        return valid_from;
    }

    public void setValid_from(String valid_from) {
        this.valid_from = valid_from;
    }

    public String getValid_till() {
        return valid_till;
    }

    public void setValid_till(String valid_till) {
        this.valid_till = valid_till;
    }

    public int getActive() { return active; }

    public void setActive(int active) { this.active = active; }

    public String getUrl() { return url; }

    public void setUrl(String url) { this.url = url; }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAttachment_file_name() { return attachment_file_name; }

    public void setAttachment_file_name(String attachment_file_name) { this.attachment_file_name = attachment_file_name; }
}

