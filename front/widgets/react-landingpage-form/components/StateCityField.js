import React from "react";
import { CustomSelect } from "./CustomSelect";
import { STATES_CITIES } from "../data/statesCities";

export function StateCityField({ field, value, onChange, hasError, autoFocus }) {
    const selectedUf = value?.uf || "";
    const selectedCity = value?.city || "";
    const cities = selectedUf ? STATES_CITIES[selectedUf] || [] : [];

    const ufOptions = field.states.map((uf) => ({ value: uf, label: uf }));
    const cityOptions = cities.map((city) => ({ value: city, label: city }));

    const handleUfChange = (uf) => {
        onChange({ uf, city: "" });
    };

    const handleCityChange = (city) => {
        onChange({ uf: selectedUf, city });
    };

    return (
        <div className="state-city-fields">
            <CustomSelect
                id="stateCity-uf"
                className="custom-select--uf"
                options={ufOptions}
                value={selectedUf}
                onChange={handleUfChange}
                placeholder="*UF"
                hasError={hasError}
                autoFocus={autoFocus}
            />

            <CustomSelect
                id="stateCity-city"
                className="custom-select--city"
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder={!selectedUf ? "Selecione a UF primeiro" : "*Cidade"}
                disabled={!selectedUf}
                hasError={hasError}
            />
        </div>
    );
}