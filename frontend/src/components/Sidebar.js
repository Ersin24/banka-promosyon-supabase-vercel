// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import ReactSelect from "react-select";
import { useSearchParams } from "react-router-dom";

const bankOptions = [
  { value: "Akbank", label: "Akbank" },
  { value: "Garanti BBVA", label: "Garanti BBVA" },
  { value: "QNB (Türkiye)", label: "QNB (Türkiye)" },
  { value: "Yapı Kredi Bankası", label: "Yapı Kredi Bankası" },
  { value: "Türkiye İş Bankası", label: "Türkiye İş Bankası" },
  { value: "Ziraat Bankası", label: "Ziraat Bankası" },
];

const categoryOptions = [
  { value: "Gıda / Market", label: "Gıda / Market" },
  { value: "Restoran / Cafe", label: "Restoran / Cafe" },
  { value: "Akaryakıt / Otomotiv", label: "Akaryakıt / Otomotiv" },
  { value: "Turizm / Seyahat", label: "Turizm / Seyahat" },
  { value: "Giyim / Kozmetik / Aksesuar", label: "Giyim / Kozmetik / Aksesuar" },
  { value: "Yurt dışı Kampanyaları", label: "Yurt dışı Kampanyaları" },
  { value: "E-Ticaret", label: "E-Ticaret" },
  { value: "Ev / Mobilya / Beyaz Eşya", label: "Ev / Mobilya / Beyaz Eşya" },
];

// onFiltersChange prop'unu alacak şekilde tanımlayın.
const Sidebar = ({ onFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Sayfa yüklendiğinde URL'deki filtreleri state'e aktar
  useEffect(() => {
    const banksFromUrl = searchParams.get("bank")
      ? searchParams.get("bank").split(",")
      : [];
    const categoriesFromUrl = searchParams.get("category")
      ? searchParams.get("category").split(",")
      : [];

    const initialBanks = bankOptions.filter(option =>
      banksFromUrl.includes(option.value)
    );
    const initialCategories = categoryOptions.filter(option =>
      categoriesFromUrl.includes(option.value)
    );
    setSelectedBanks(initialBanks);
    setSelectedCategories(initialCategories);
  }, [searchParams]);

  // "Filtre Uygula" butonuna tıklandığında URL'yi güncelliyoruz
  const applyFilters = () => {
    const banksParam = selectedBanks.map(opt => opt.value).join(",");
    const categoriesParam = selectedCategories.map(opt => opt.value).join(",");
    const newParams = {};
    if (banksParam) newParams.bank = banksParam;
    if (categoriesParam) newParams.category = categoriesParam;
    setSearchParams(newParams);
    // Eğer üst bileşene de bildirilecekse:
    if (onFiltersChange) {
      onFiltersChange({ banks: selectedBanks.map(opt => opt.value), categories: selectedCategories.map(opt => opt.value) });
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      <Heading size="xs">Banka Seçiniz</Heading>
      <ReactSelect
        isMulti
        options={bankOptions}
        placeholder="Banka seçin..."
        value={selectedBanks}
        onChange={setSelectedBanks}
      />
      <Heading size="xs" mt={4}>
        Kategori Seçiniz
      </Heading>
      <ReactSelect
        isMulti
        options={categoryOptions}
        placeholder="Kategori seçin..."
        value={selectedCategories}
        onChange={setSelectedCategories}
      />
      <Button colorScheme="blue" mt={4} onClick={applyFilters}>
        Filtre Uygula
      </Button>
    </VStack>
  );
};

export default Sidebar;
