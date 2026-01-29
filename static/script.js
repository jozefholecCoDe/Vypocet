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

// 2. Export s vylepšenou hlavičkou a fixnutým okrajom
document.addEventListener('DOMContentLoaded', () => {
    const insuranceForm = document.getElementById('insuranceForm');
    if (insuranceForm) {
        insuranceForm.addEventListener('input', calculateInsurance);
    }
    calculateInsurance();

    const pdfBtn = document.getElementById('downloadPdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Zber údajov
            const clientName = document.getElementById('clientName').value || "Nezadaný";
            const managerName = document.getElementById('managerName').value || "Nezadaný";
            const income = document.getElementById('netIncome').value || "0";
            const mortgage = document.getElementById('mortage').value || "0";
            const pK = document.getElementById('coverage').value || "0";
            const pI = document.getElementById('investment').value || "0";
            const pD = document.getElementById('retirement').value || "0";
            const r18 = document.getElementById('age_18').value || "0";
            const r65 = document.getElementById('age_65').value || "0";
            
            const eurK = document.getElementById('r-coverage').innerText || "0.00";
            const eurI = document.getElementById('r-investment').innerText || "0.00";
            const eurD = document.getElementById('r-retirement').innerText || "0.00";
            const budget = document.getElementById('total').innerText || "0.00";
            
            const now = new Date().toLocaleString('sk-SK');

            // Pomocný kontajner pre PDF (šírka 700px je ideálna pre A4)
            const pdfWrapper = document.createElement('div');
            pdfWrapper.style.width = '700px'; 
            pdfWrapper.style.padding = '25px';
            pdfWrapper.style.backgroundColor = 'white';
            pdfWrapper.style.boxSizing = 'border-box';
            pdfWrapper.style.fontFamily = 'Arial, sans-serif';

            pdfWrapper.innerHTML = `
                <div style="border-bottom: 3px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 20px;">
                    <h1 style="color: #1d4ed8; font-size: 22px; margin: 0; text-transform: uppercase;">ANALÝZA POISTNÉHO KRYTIA</h1>
                    <p style="font-size: 10px; color: #64748b; margin: 5px 0 0 0; font-weight: bold;">Vyhotovené: ${now}</p>
                </div>

                <div style="display: flex; gap: 20px; margin-bottom: 25px; box-sizing: border-box; align-items: stretch;">
                    <div style="flex: 1.1; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 9px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 10px;">Identifikácia a príjem</div>
                            <table style="width: 100%; font-size: 12px; color: #1e293b; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 4px 0; color: #64748b;">👤 Klient:</td>
                                    <td style="text-align: right; font-weight: bold;">${clientName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #64748b;">💼 Agent:</td>
                                    <td style="text-align: right; font-weight: bold;">${managerName}</td>
                                </tr>
                            </table>
                        </div>
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                            <table style="width: 100%; font-size: 12px; color: #1e293b; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 4px 0; color: #64748b;">💰 Mesačný príjem:</td>
                                    <td style="text-align: right; font-weight: bold; color: #16a34a; font-size: 14px;">${income} €</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #64748b;">🏠 Hypotéka:</td>
                                    <td style="text-align: right; font-weight: bold; color: #dc2626;">${mortgage} €</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div style="flex: 0.9; background: #1e3a8a; padding: 18px; border-radius: 8px; color: white; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 10px; text-transform: uppercase; opacity: 0.8; margin-bottom: 2px;">Mesačný rozpočet celkom</div>
                            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #3b82f6; padding-bottom: 5px;">${budget} €</div>
                        </div>
                        
                        <table style="width: 100%; font-size: 11px; color: white; border-collapse: collapse;">
                            <tr><td style="padding: 2px 0;">Krytie (${pK}%):</td><td style="text-align: right; font-weight: bold;">${eurK} €</td></tr>
                            <tr><td style="padding: 2px 0;">Investovanie (${pI}%):</td><td style="text-align: right; font-weight: bold;">${eurI} €</td></tr>
                            <tr><td style="padding: 2px 0;">Dôchodok (${pD}%):</td><td style="text-align: right; font-weight: bold;">${eurD} €</td></tr>
                            <tr>
                                <td style="padding: 8px 0 0 0; opacity: 0.8; font-size: 10px;" colspan="2">
                                    ⏱ Dieťa (18): <strong>${r18}r</strong> | Dôchodok (65): <strong>${r65}r</strong>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div id="pdf-table-area" style="width: 100%; box-sizing: border-box;"></div>
            `;

            // Rekonštrukcia hlavnej tabuľky pre PDF (aby sme predišli problémom s CSS)
            const isB15 = document.getElementById('bonus_15').checked;
            const isB25 = document.getElementById('bonus_25').checked;
            
            let tableHTML = `
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background-color: #3759c8;">
                            <th style="width: 44%; padding: 10px; text-align: left; color: white; font-size: 10px; border: 1px solid #1e40af;">RIZIKO / UDALOSŤ</th>
                            <th style="width: 18.6%; padding: 10px; text-align: right; color: white; font-size: 10px; border: 1px solid #1e40af;">ZÁKLAD</th>
                            ${isB15 ? '<th style="width: 18.6%; padding: 10px; text-align: right; color: white; font-size: 10px; border: 1px solid #1e40af;">BONUS 15%</th>' : ''}
                            ${isB25 ? '<th style="width: 18.6%; padding: 10px; text-align: right; color: white; font-size: 10px; border: 1px solid #1e40af;">BONUS 25%</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>`;

            const rows = document.querySelector('.results').querySelectorAll('tr');
            rows.forEach(row => {
                if (row.innerText.trim() === "" || row.querySelector('th')) return;

                // Ak je to kategória (modrý riadok)
                if (row.style.backgroundColor.includes('rgb(239') || row.classList.contains('section-title')) {
                    const totalCols = 1 + 1 + (isB15 ? 1 : 0) + (isB25 ? 1 : 0);
                    tableHTML += `
                        <tr style="background-color: #eff6ff;">
                            <td colspan="${totalCols}" style="padding: 8px; font-weight: bold; color: #1e40af; font-size: 11px; border: 1px solid #cbd5e1; text-align: center; text-transform: uppercase;">
                                ${row.cells[0].innerText.trim()}
                            </td>
                        </tr>`;
                } else {
                    // Bežný riadok rizika
                    tableHTML += `<tr>`;
                    const visibleCells = Array.from(row.cells).filter(c => window.getComputedStyle(c).display !== 'none');
                    visibleCells.forEach((cell, idx) => {
                        tableHTML += `
                            <td style="padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 11px; color: black; text-align: ${idx === 0 ? 'left' : 'right'}; ${idx > 0 ? 'font-weight: bold;' : ''}">
                                ${cell.innerText.trim()}
                            </td>`;
                    });
                    tableHTML += `</tr>`;
                }
            });

            tableHTML += `</tbody></table>`;
            pdfWrapper.querySelector('#pdf-table-area').innerHTML = tableHTML;

            // Parametre pre generovanie PDF
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Analyza_${clientName.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            pdfBtn.innerHTML = "⌛ Generujem...";
            
            html2pdf().set(opt).from(pdfWrapper).save().then(() => {
                pdfBtn.innerHTML = "Stiahnuť analýzu (PDF)";
            }).catch(err => {
                console.error(err);
                pdfBtn.innerHTML = "Chyba pri generovaní";
            });
        });
    }
});
