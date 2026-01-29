function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
}

function calculateInsurance() {
    // 1. Vstupy
    const income = parseFloat(document.getElementById('netIncome').value) || 0;
    const age_18 = parseFloat(document.getElementById('age_18').value) || 0;
    const age_65 = parseFloat(document.getElementById('age_65').value) || 0;
    const mortage = parseFloat(document.getElementById('mortage').value) || 0;

    // 2. Základné sumy (Risks)
    const risks = {
        mort: income * 3,
        mort_kid: income * 9,
        mort_down: income * 0.15 * 12 * age_18,
        mort_down_hypo: mortage,
        mort_down_hypo_kid: (income * 0.15 * 12 * age_18) + mortage,
        critical_illnesses: income * 12,
        critical_illnesses_sex: income * 12,
        carcinoma: income * 2,
        mild_forms_cancer: income * 3,
        disability_41: income * 6,
        disability_71: income * 12,
        disability_71_down: income * 0.1 * 12 * age_65,
        TNU: income * 10,
        painful: 3600,
        fractures_burns: income * 2,
        PN: (income * 0.4) / 30,
        hospitalization: income * 0.1,
        surgical: income * 1.5
    };

    // Zápis základných sum
    for (let key in risks) {
        updateText(key, risks[key].toLocaleString('sk-SK') + " €");
    }

    // 3. Logika pre Bonusy (Skrývanie stĺpcov)
    const bonusConfigs = [
        { id: 'bonus_15', suffix: '_b15', header: 'header_b15', rate: 0.85 },
        { id: 'bonus_25', suffix: '_b25', header: 'header_b25', rate: 0.75 }
    ];

    bonusConfigs.forEach(config => {
        const isChecked = document.getElementById(config.id).checked;
        const headerEl = document.getElementById(config.header);
        
        // Skrytie/Zobrazenie hlavičky
        if (headerEl) headerEl.style.visibility = isChecked ? "visible" : "hidden";

        // Prejdenie všetkých buniek v stĺpci
        for (let key in risks) {
            const el = document.getElementById(key + config.suffix);
            if (el) {
                const cell = el.parentElement; // td element
                if (isChecked) {
                    const val = (risks[key] * config.rate).toLocaleString('sk-SK', { minimumFractionDigits: 2 });
                    el.innerText = val + " €";
                    cell.style.visibility = "visible";
                } else {
                    el.innerText = "";
                    cell.style.visibility = "hidden";
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('insuranceForm').addEventListener('input', calculateInsurance);
    calculateInsurance();
});