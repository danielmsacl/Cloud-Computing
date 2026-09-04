// REDIRECCIÓN DEL BOTÓN "VER CATÁLOGO" (desde index.html)


const botonPagina2 = document.getElementById('pagina_2');
if (botonPagina2) {
    botonPagina2.addEventListener('click', function() {
        window.location.href = "html/menu_general.html";
    });
}


// FUNCIÓN PARA CARGAR PRODUCTOS DESDE JSON


function cargarProductosJSON() {
    const tablaBody = document.getElementById('cuerpoTabla');
    const mensajeEstado = document.getElementById('mensajeEstado');
    
    if (!tablaBody) return;
    
    if (mensajeEstado) {
        mensajeEstado.textContent = '⏳ Cargando productos desde JSON...';
        mensajeEstado.className = 'mensaje-estado cargando';
    }
    
    fetch('../datos/productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(productos => {
            tablaBody.innerHTML = '';
            
            if (!productos || productos.length === 0) {
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
            
            productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.marca}</td>
                    <td>$${producto.precio ? producto.precio.toFixed(2) : '0.00'}</td>
                `;
                tablaBody.appendChild(fila);
            });
            
            if (mensajeEstado) {
                mensajeEstado.textContent = `✅ ${productos.length} productos cargados correctamente desde JSON`;
                mensajeEstado.className = 'mensaje-estado exito';
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #c0392b;">
                        ❌ Error al cargar los productos desde JSON
                    </td>
                </tr>
            `;
            
            if (mensajeEstado) {
                mensajeEstado.textContent = '❌ Error: No se pudieron cargar los productos desde JSON';
                mensajeEstado.className = 'mensaje-estado error';
            }
        });
}

// REDIRECCIÓN DEL BOTÓN "VOLVER" (desde tabla_json.html)


function configurarBotonVolver() {
    const botonVolver = document.getElementById('volver');
    if (botonVolver) {
        botonVolver.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../index.html';  // ✅ Sube un nivel desde /html/
        });
    }
}



document.addEventListener('DOMContentLoaded', function() {
    cargarProductosJSON();
    configurarBotonVolver();
});