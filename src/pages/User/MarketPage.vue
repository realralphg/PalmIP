<template>
  <q-page>
    <q-card class="q-mt-sm no-shadow" bordered>
      <TitleSection separator title="Market Place" />
      <q-card-section class="q-pa-none q-ma-none">
        <q-table
          class="no-shadow no-border"
          :rows="sales_data"
          :columns="sales_column"
          hide-bottom
        >
          <template v-slot:body-cell-crop="props">
            <q-td :props="props">
              <q-item class="q-pl-none">
                <q-item-section avatar>
                  <q-avatar square>
                    <img :src="props.row.prod_img" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ props.row.code }}</q-item-label>
                  <q-item-label>{{ props.row.product_name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="props.row.avatar" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ props.row.name }}</q-item-label>
                  <q-item-label caption class="">
                    {{ props.row.address }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-grade="props">
            <q-td :props="props" class="text-left">
              <q-chip
                color="primary"
                class="text-white text-capitalize"
                :label="props.row.grade"
              ></q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import apple from "src/assets/crops/apple.jpg";
import avatar from "src/assets/avatar.jpg";
import TitleSection from "src/components/TitleSection.vue";

const sales_data = [
  {
    name: "Abu Muhamad",
    type: "Cos Rice",
    grade: "A",
    location: "Kaduna",
    address: "31 Farm road, Kaduna",
    avatar: avatar,
    product_name: "Rice",
    qty: "10 KG",
    prod_img: apple,
  },
  {
    name: "John Okafor",
    type: "Red Maize",
    location: "Kaduna",
    address: "31 Farm road, Kaduna",
    grade: "B",
    avatar: avatar,
    product_name: "Maize",
    qty: "5 Bags",
    prod_img: apple,
  },
  {
    name: "Jibril Isah",
    type: "Ofada",
    grade: "C",
    location: "Kaduna",
    address: "31 Farm road, Kaduna",
    avatar: avatar,
    product_name: "Rice",
    qty: "100 KG",
    prod_img: apple,
  },
  {
    name: "Usman Yanusa",
    type: "Ofada",
    grade: "A",
    location: "Kaduna",
    address: "31 Farm road, Kaduna",
    avatar: avatar,
    product_name: "Rice",
    qty: "100 KG",
    prod_img: apple,
  },
];
const sales_column = [
  {
    name: "name",
    label: "Seller",
    field: "name",
    sortable: true,
    align: "left",
  },
  {
    name: "crop",
    label: "Crop",
    field: "crop",
    sortable: true,
    align: "left",
  },
  {
    name: "location",
    label: "Location",
    field: "location",
    sortable: true,
    align: "left",
  },
  {
    name: "qty",
    label: "Quantity",
    field: "qty",
    sortable: true,
    align: "right",
    classes: "text-bold",
  },
  {
    name: "type",
    label: "Type",
    field: "type",
    sortable: true,
    align: "left",
    classes: "text-bold",
  },
  {
    name: "grade",
    label: "Grade",
    field: "grade",
    sortable: true,
    align: "left",
    classes: "text-bold",
  },
];
</script>
