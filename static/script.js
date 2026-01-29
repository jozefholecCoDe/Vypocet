// 1. Pomocné funkcie pre výpočty
function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
}

function calculateInsurance() {
    const income = parseFloat(document.getElementById('netIncome').value) || 0;
    const coverage = parseFloat(document.getElementById('coverage').value) || 0;
    const investment = parseFloat(document.getElementById('investment').value) || 0;
    const retirement = parseFloat(document.getElementById('retirement').value) || 0;
    
    const age_18 = parseFloat(document.getElementById('age_18').value) || 0;
    const age_65 = parseFloat(document.getElementById('age_65').value) || 0;
    const mortgage = parseFloat(document.getElementById('mortage').value) || 0;

    const coverageAmount = (coverage / 100) * income;
    const investmentAmount = (investment / 100) * income;
    const retirementAmount = (retirement / 100) * income;
    const total = coverageAmount + investmentAmount + retirementAmount;

    updateText('total', total.toFixed(2));
    updateText('r-coverage', coverageAmount.toFixed(2));
    updateText('r-investment', investmentAmount.toFixed(2));
    updateText('r-retirement', retirementAmount.toFixed(2));

    const risks = {
        mort: income * 3,
        mort_kid: income * 9,
        mort_down: income * 0.15 * 12 * age_18,
        mort_down_hypo: mortgage,
        mort_down_hypo_kid: (income * 0.15 * 12 * age_18) + mortgage,
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

    for (let key in risks) {
        updateText(key, risks[key].toLocaleString('sk-SK') + " €");
    }

    const bonusConfigs = [
        { id: 'bonus_15', suffix: '_b15', header: 'header_b15', rate: 0.85 },
        { id: 'bonus_25', suffix: '_b25', header: 'header_b25', rate: 0.75 }
    ];

    bonusConfigs.forEach(config => {
        const isChecked = document.getElementById(config.id).checked;
        const headerEl = document.getElementById(config.header);
        if (headerEl) headerEl.style.display = isChecked ? "table-cell" : "none";

        for (let key in risks) {
            const el = document.getElementById(key + config.suffix);
            if (el) {
                const cell = el.parentElement; 
                if (isChecked) {
                    const val = (risks[key] * config.rate).toLocaleString('sk-SK', { minimumFractionDigits: 2 });
                    el.innerText = val + " €";
                    cell.style.display = "table-cell";
                } else {
                    el.innerText = "";
                    cell.style.display = "none";
                }
            }
        }
    });
}

// 2. Inicializácia a PDF Export
document.addEventListener('DOMContentLoaded', () => {
    // Registrácia výpočtov
    const insuranceForm = document.getElementById('insuranceForm');
    if (insuranceForm) {
        insuranceForm.addEventListener('input', calculateInsurance);
    }
    calculateInsurance();

    // TLAČIDLO PDF
    const pdfBtn = document.getElementById('downloadPdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const resultsElement = document.querySelector('.results');
            
            // 1. Zber vstupných hodnôt pre hlavičku PDF
            const clientName = document.getElementById('clientName').value || "Nezadaný klient";
            const managerName = document.getElementById('managerName').value || "Nezadaný agent";
            const income = document.getElementById('netIncome').value || "0";
            const budget = document.getElementById('total').innerText || "0";
            const mortgage = document.getElementById('mortage').value || "0";
            const percK = document.getElementById('coverage').value || "0";
            const percI = document.getElementById('investment').value || "0";
            const percD = document.getElementById('retirement').value || "0";
            const r18 = document.getElementById('age_18').value || "0";
            const r65 = document.getElementById('age_65').value || "0";
            const now = new Date().toLocaleString('sk-SK');

            // 2. Vytvorenie dočasného kontajnera pre PDF (aby sme neovplyvnili web)
            const pdfContainer = document.createElement('div');
            pdfContainer.style.padding = '20px';
            pdfContainer.style.backgroundColor = 'white';
            pdfContainer.style.color = 'black'; // Vynútené čierne písmo
            pdfContainer.style.fontFamily = 'Arial, sans-serif';

            // 3. Pridanie HLAVIČKY s výraznejšími farbami
            pdfContainer.innerHTML = `
                <div style="margin-bottom: 15px; border-bottom: 3px solid #1d4ed8; padding-bottom: 8px;">
                    <h2 style="color: #1d4ed8; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Analýza poistného krytia</h2>
                    <p style="color: #475569; font-size: 10px; margin: 2px 0 0 0; font-weight: bold;">Vyhotovené: ${now}</p>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; background: #eff6ff; padding: 12px; border: 1px solid #bfdbfe; border-left: 5px solid #1d4ed8; border-radius: 4px; margin-bottom: 20px; color: #1e3a8a; font-size: 11px; line-height: 1.5;">
                    <div style="flex: 1; min-width: 180px;">
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Klient:</strong> <span style="color: #000;">${clientName}</span></p>
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Agent:</strong> <span style="color: #000;">${managerName}</span></p>
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Čistý príjem:</strong> <span style="color: #000; font-weight: bold;">${income} €</span></p>
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Hypotéka:</strong> <span style="color: #000;">${mortgage} €</span></p>
                    </div>
                    <div style="flex: 1; min-width: 180px;">
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Mesačný rozpočet:</strong> <span style="color: #1d4ed8; font-weight: bold; font-size: 13px;">${budget} €</span></p>
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Rozdelenie (K/I/D):</strong> <span style="color: #000;">${percK}% / ${percI}% / ${percD}%</span></p>
                        <p style="margin: 3px 0;"><strong><span style="color: #1d4ed8;">●</span> Roky (dieťa/dôchodok):</strong> <span style="color: #000;">${r18} / ${r65}</span></p>
                    </div>
                </div>
                <div id="pdf-table-content"></div>
            `;

            // 4. FINÁLNY DIZAJN (Vynútená biela a čierna s vysokým kontrastom)
            let tableHTML = `
                <div style="width: 100%; font-family: Arial, sans-serif; background-color: #ffffff;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; border: 2px solid #1e40af;">
                    <thead>
                        <tr style="background-color: #3759c8 !important; -webkit-print-color-adjust: exact;">
                            <th style="width: 50%; padding: 12px 10px; border: 1px solid #1e40af; text-align: left; color: #ffffff !important; font-size: 11px; font-weight: 900; text-shadow: 0px 0px 1px #ffffff;">RIZIKO / POISTNÁ UDALOSŤ</th>
                            <th style="width: 25%; padding: 12px 10px; border: 1px solid #1e40af; text-align: right; color: #ffffff !important; font-size: 11px; font-weight: 900; text-shadow: 0px 0px 1px #ffffff;">ZÁKLADNÁ SUMA</th>
                            ${document.getElementById('bonus_15').checked ? '<th style="width: 25%; padding: 12px 10px; border: 1px solid #1e40af; text-align: right; color: #ffffff !important; font-size: 11px; font-weight: 900; text-shadow: 0px 0px 1px #ffffff;">BONUS 15%</th>' : ''}
                            ${document.getElementById('bonus_25').checked ? '<th style="width: 25%; padding: 12px 10px; border: 1px solid #1e40af; text-align: right; color: #ffffff !important; font-size: 11px; font-weight: 900; text-shadow: 0px 0px 1px #ffffff;">BONUS 25%</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
            `;

            const rows = resultsElement.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                if (row.classList.contains('section-title')) {
                    const colSpan = 2 + (document.getElementById('bonus_15').checked ? 1 : 0) + (document.getElementById('bonus_25').checked ? 1 : 0);
                    tableHTML += `
                        <tr style="background-color: #eff6ff !important; -webkit-print-color-adjust: exact;">
                            <td colspan="${colSpan}" style="padding: 10px; border: 1px solid #1e40af; color: #1e40af !important; font-weight: bold; font-size: 12px; text-align: center; text-transform: uppercase;">
                                ${row.innerText.trim()}
                            </td>
                        </tr>`;
                } else {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 0) {
                        tableHTML += `<tr style="background-color: #ffffff !important;">`;
                        cells.forEach((cell, index) => {
                            if (window.getComputedStyle(cell).display !== 'none') {
                                const textAlign = index === 0 ? 'left' : 'right';
                                // Tu vynucujeme SÝTU ČIERNU a hrubšie písmo
                                tableHTML += `
                                    <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: ${textAlign}; color: #000000 !important; font-size: 11px; font-weight: ${index === 0 ? '500' : '700'};">
                                        ${cell.innerText.trim()}
                                    </td>`;
                            }
                        });
                        tableHTML += `</tr>`;
                    }
                }
            });

            tableHTML += `</tbody></table></div>`;
            pdfContainer.querySelector('#pdf-table-content').innerHTML = tableHTML;

            // 5. NASTAVENIA EXPORTU (Zvýšenie kvality pre text)
            const opt = {
                margin: [10, 10],
                filename: `Analyza_${clientName.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'png' }, // PNG je lepšie pre text ako JPEG
                html2canvas: { 
                    scale: 2, // Zvýšená mierka pre maximálnu ostrosť textu
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    letterRendering: true, // Pomáha s čitateľnosťou písmen
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(pdfContainer).save();
        });
    }
});

