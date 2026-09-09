const API_KEY = 'AIzaSyBMBxut4ZLzM9Efv7BbCc-s5Yvw7FFMLVI';
const SHEET_ID = '1rWmAjmCOZsAzDtHloaAqcY3XIVdbn7BBEd6DEOEREA4';
const RANGO = "'Hoja 1'!A:D";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyfYixWq1Ri94FUOHEu4Kl-kWdaZSc_zC15--EBUB7yKHqMiDUK6MxOL6dYAbz1EAKD/exec';

let datosCompletos = [];

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
                        <td colspan="5" style="text-align: center; padding: 2rem; color: #6b5d4e;">
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
            datosCompletos = rows;
            
            rows.forEach((row, index) => {
                const fila = document.createElement('tr');
                fila.id = `fila-${index}`;
                fila.innerHTML = `
                    <td>${row[0] || ''}</td>
                    <td>${row[1] || ''}</td>
                    <td>${row[2] || ''}</td>
                    <td>$${row[3] ? parseFloat(row[3]).toFixed(2) : '0.00'}</td>
                    <td>
                        <div class="acciones-celda">
                            <button class="btn-editar-fila" data-fila="${index}" data-id="${row[0] || ''}">✏️ Editar</button>
                            <button class="btn-eliminar-fila" data-fila="${index}" data-id="${row[0] || ''}">🗑️ Eliminar</button>
                        </div>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });
            
            document.querySelectorAll('.btn-editar-fila').forEach(btn => {
                btn.addEventListener('click', function() {
                    const filaIndex = parseInt(this.getAttribute('data-fila'));
                    const id = this.getAttribute('data-id');
                    abrirModalEditar(filaIndex, id);
                });
            });
            
            document.querySelectorAll('.btn-eliminar-fila').forEach(btn => {
                btn.addEventListener('click', function() {
                    const filaIndex = parseInt(this.getAttribute('data-fila'));
                    const id = this.getAttribute('data-id');
                    eliminarProducto(filaIndex, id);
                });
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
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #c0392b;">
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

function agregarProducto() {
    const id = document.getElementById('inputId').value;
    const nombre = document.getElementById('inputNombre').value;
    const marca = document.getElementById('inputMarca').value;
    const precio = document.getElementById('inputPrecio').value;
    
    if (!id || !nombre || !marca || !precio) {
        alert('⚠️ Por favor, completa todos los campos');
        return;
    }
    
    const mensajeEstado = document.getElementById('mensajeEstado');
    mensajeEstado.textContent = '⏳ Agregando producto...';
    mensajeEstado.className = 'mensaje-estado cargando';
    
    const data = {
        action: 'agregar',
        id: id,
        nombre: nombre,
        marca: marca,
        precio: parseFloat(precio)
    };
    
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        mensajeEstado.textContent = '✅ Producto agregado correctamente';
        mensajeEstado.className = 'mensaje-estado exito';
        cerrarModalAgregar();
        setTimeout(() => cargarDesdeGoogleSheets(), 1500);
    })
    .catch(error => {
        console.error('Error al agregar:', error);
        mensajeEstado.textContent = '❌ Error al agregar el producto';
        mensajeEstado.className = 'mensaje-estado error';
        alert('⚠️ Error al agregar el producto. Revisa la consola para más detalles.');
    });
}

function editarProducto() {
    const id = document.getElementById('editId').value;
    const nombre = document.getElementById('editNombre').value;
    const marca = document.getElementById('editMarca').value;
    const precio = document.getElementById('editPrecio').value;
    const filaIndex = parseInt(document.getElementById('editIndex').value);
    const filaReal = filaIndex + 2;
    
    if (!id || !nombre || !marca || !precio) {
        alert('⚠️ Por favor, completa todos los campos');
        return;
    }
    
    const mensajeEstado = document.getElementById('mensajeEstado');
    mensajeEstado.textContent = '⏳ Editando producto...';
    mensajeEstado.className = 'mensaje-estado cargando';
    
    const data = {
        action: 'editar',
        filaReal: filaReal,
        id: id,
        nombre: nombre,
        marca: marca,
        precio: parseFloat(precio)
    };
    
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        mensajeEstado.textContent = '✅ Producto editado correctamente';
        mensajeEstado.className = 'mensaje-estado exito';
        cerrarModalEditar();
        setTimeout(() => cargarDesdeGoogleSheets(), 1500);
    })
    .catch(error => {
        console.error('Error al editar:', error);
        mensajeEstado.textContent = '❌ Error al editar el producto';
        mensajeEstado.className = 'mensaje-estado error';
        alert('⚠️ Error al editar el producto. Revisa la consola para más detalles.');
    });
}

function eliminarProducto(filaIndex, id) {
    if (!confirm(`¿Estás seguro de eliminar el producto con ID "${id}"?`)) {
        return;
    }
    
    const mensajeEstado = document.getElementById('mensajeEstado');
    mensajeEstado.textContent = '⏳ Eliminando producto...';
    mensajeEstado.className = 'mensaje-estado cargando';
    
    const filaReal = filaIndex + 2;
    
    const data = {
        action: 'eliminar',
        filaReal: filaReal
    };
    
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        mensajeEstado.textContent = '✅ Producto eliminado correctamente';
        mensajeEstado.className = 'mensaje-estado exito';
        setTimeout(() => cargarDesdeGoogleSheets(), 1500);
    })
    .catch(error => {
        console.error('Error al eliminar:', error);
        mensajeEstado.textContent = '❌ Error al eliminar el producto';
        mensajeEstado.className = 'mensaje-estado error';
        alert('⚠️ Error al eliminar el producto. Revisa la consola para más detalles.');
    });
}

function abrirModalAgregar() {
    const modal = document.getElementById('modalAgregar');
    if (modal) {
        document.getElementById('inputId').value = '';
        document.getElementById('inputNombre').value = '';
        document.getElementById('inputMarca').value = '';
        document.getElementById('inputPrecio').value = '';
        modal.style.display = 'flex';
    }
}

function cerrarModalAgregar() {
    const modal = document.getElementById('modalAgregar');
    if (modal) {
        modal.style.display = 'none';
    }
}

function abrirModalEditar(filaIndex, id) {
    const modal = document.getElementById('modalEditar');
    if (modal) {
        const fila = datosCompletos[filaIndex];
        if (fila) {
            document.getElementById('editId').value = fila[0] || '';
            document.getElementById('editNombre').value = fila[1] || '';
            document.getElementById('editMarca').value = fila[2] || '';
            document.getElementById('editPrecio').value = fila[3] || '';
            document.getElementById('editIndex').value = filaIndex;
            document.getElementById('editIdOriginal').value = id;
            modal.style.display = 'flex';
        }
    }
}

function cerrarModalEditar() {
    const modal = document.getElementById('modalEditar');
    if (modal) {
        modal.style.display = 'none';
    }
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

function configurarBotonAgregar() {
    const botonAgregar = document.getElementById('boton_crud');
    if (botonAgregar) {
        botonAgregar.addEventListener('click', function(e) {
            abrirModalAgregar();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDesdeGoogleSheets();
    configurarBotonVolver();
    configurarBotonAgregar();
});