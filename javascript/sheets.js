const API_KEY = 'AIzaSyBMBxut4ZLzM9Efv7BbCc-s5Yvw7FFMLVI';
const SHEET_ID = '1rWmAjmCOZsAzDtHloaAqcY3XIVdbn7BBEd6DEOEREA4';
const RANGO = "'Hoja 1'!A:D";  

function cargarDesdeGoogleSheets() {
    const tablaBody = document.getElementById('cuerpoTabla');
    const mensajeEstado = document.getElementById('mensajeEstado');
    
    if (!tablaBody) return;
    
    if (mensajeEstado) {
        mensajeEstado.textContent = '⏳ Cargando datos desde Google Sheets...';
        mensajeEstado.className = 'mensaje-estado cargando';
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGO}?key=${API_KEY}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tablaBody.innerHTML = '';
            
            if (!data.values || data.values.length <= 1) {
                tablaBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 2rem; color: #6b5d4e;">
                            📭 No hay productos disponibles
                        </td>
                    </tr>
                `;
                if (mensajeEstado) {
                    mensajeEstado.textContent = '📭 No hay productos para mostrar';
                    mensajeEstado.className = 'mensaje-estado';
                }
                return;
            }
            
            const rows = data.values.slice(1);
            
            rows.forEach(row => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${row[0] || ''}</td>
                    <td>${row[1] || ''}</td>
                    <td>${row[2] || ''}</td>
                    <td>$${row[3] ? parseFloat(row[3]).toFixed(2) : '0.00'}</td>
                `;
                tablaBody.appendChild(fila);
            });
            
            if (mensajeEstado) {
                mensajeEstado.textContent = `✅ ${rows.length} productos cargados desde Google Sheets`;
                mensajeEstado.className = 'mensaje-estado exito';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #c0392b;">
                        ❌ Error al cargar los productos desde Google Sheets
                    </td>
                </tr>
            `;
            
            if (mensajeEstado) {
                mensajeEstado.textContent = '❌ Error: No se pudieron cargar los datos';
                mensajeEstado.className = 'mensaje-estado error';
            }
        });
}

function configurarBotonVolver() {
    const botonVolver = document.getElementById('volver');
    if (botonVolver) {
        botonVolver.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDesdeGoogleSheets();
    configurarBotonVolver();
});