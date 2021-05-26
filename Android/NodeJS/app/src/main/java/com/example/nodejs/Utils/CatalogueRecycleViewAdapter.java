package com.example.nodejs.Utils;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.example.nodejs.Model.Catalogue;
import com.example.nodejs.R;

import java.util.ArrayList;

public class CatalogueRecycleViewAdapter extends RecyclerView.Adapter<CatalogueRecycleViewAdapter.ViewHolder> {
    private ArrayList<Catalogue> mData;
    private LayoutInflater mInflater;
    private ItemClickListener mClickListener;
    Catalogue catalogueElement;

    // Data is passed into constructor
    public CatalogueRecycleViewAdapter(Context context, ArrayList<Catalogue> data){
        this.mInflater = LayoutInflater.from(context);
        this.mData = data;
    }

    // Inflates the row layout from 'xml' when needed
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = mInflater.inflate(R.layout.catalogue_card_layout, parent, false);
        return new ViewHolder(view);
    }

    // Binds the data to the 'TextView' in each row
    @Override
    public void onBindViewHolder(ViewHolder holder, int i) {
        catalogueElement = mData.get(i);
        holder.catalogueItemName.setText(catalogueElement.getSeller());
        holder.catalogueItemAddress.setText(catalogueElement.getAddress());
        holder.catalogueItemDiscount.setText(catalogueElement.getDiscount_rate());
    }

    // Total number of rows
    @Override
    public int getItemCount() {
        System.out.print(mData);
        if (mData != null) {
            return mData.size();
        }
        return 0;
    }

    // Stores and recycles views as they are scrolled off screen
    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener{
        TextView catalogueItemName;
        TextView catalogueItemAddress;
        TextView catalogueItemDiscount;

        ViewHolder(View itemView) {
            super(itemView);
            catalogueItemName = itemView.findViewById(R.id.cardNameView);
            catalogueItemAddress = itemView.findViewById(R.id.cardAddressView);
            catalogueItemDiscount = itemView.findViewById(R.id.cardDiscountView);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View view) {
            if (mClickListener != null) mClickListener.onItemClick(view, getAdapterPosition());
        }
    }

    // Convenience method for getting data at click position
    public Catalogue getItem(int id) {
        return mData.get(id);
    }

    // Parent activity will implement this method to respond to click events
    public interface ItemClickListener{
        void onItemClick(View view, int position);
    }

    // Allows clicks events to be caught
    public void setClickListener(ItemClickListener itemClickListener){
        this.mClickListener = itemClickListener;
    }
}
