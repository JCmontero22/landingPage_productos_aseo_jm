var cart = [];
var whatsappNumber = "573156557351"; // Reemplaza con tu número de WhatsApp
function init() {
    AOS.init({ duration: 800, once: true });

    $(".navbar-nav .nav-link").on("click", function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            var offset = $(hash).offset() ? $(hash).offset().top : 0;
            $("html, body").animate({ scrollTop: offset }, 800);
        }
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $(".navbar").css("background-color", "rgba(3, 4, 94, 0.95)");
        } else {
            $(".navbar").css("background-color", "rgba(3, 4, 94, 0.9)");
        }
    });

    filtroCategorias();
    actualizacionPrecioCategoria();
    consultaProductos();
    $(".product-size-select").on("change", function () {
        actualizacionPrecioCategoria($(this));
    });
}

function filtroCategorias() {
    $(".filter-buttons .btn").on("click", function () {
        $(".filter-buttons .btn").removeClass("active");
        $(this).addClass("active");
        var filterValue = $(this).attr("data-filter");
        $(".product-item")
            .fadeOut(200)
            .promise()
            .done(function () {
                if (filterValue === "all") {
                    $(".product-item").fadeIn(400);
                } else {
                    $(".product-item")
                        .filter('[data-category="' + filterValue + '"]')
                        .fadeIn(400);
                }
            });
    });
}

function consultaProductos() {
    $.ajax({
        url: "ajax/listadoProductos.php",
        type: "GET",
        success: function (data) {
            data = JSON.parse(data);
            let productosMap = mapeoProductos(data);
            renderProductos(productosMap);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(
                "Error al obtener los productos:",
                textStatus,
                errorThrown
            );
        },
    });
}

function mapeoProductos(data) {
    const productosMap = {};
    data.forEach((item) => {
        if (!productosMap[item.idProducto]) {
            productosMap[item.idProducto] = {
                idProducto: item.idProducto,
                nombre: item.nombre,
                categoria: item.categoria,
                img: item.img,
                precio: item.precio,
                presentaciones: [],
            };
        }
        productosMap[item.idProducto].presentaciones.push({
            idPresentacion: item.idPresentacion,
            tamanio: item.tamanio,
            precio: item.precio,
        });
    });

    return productosMap;
}

function renderProductos(productosMap) {
    const productList = $("#product-list");
    productList.empty();
    Object.values(productosMap).forEach((producto) => {
        let opciones = "";
        producto.presentaciones.forEach((pres) => {
            opciones += `<option value="${pres.idPresentacion}" data-precio="${pres.precio}">${pres.tamanio}</option>`;
        });

        const cardHtml = `
            <div class="col-lg-4 col-md-6 product-item pb-3" data-category="${producto.categoria}" data-aos="fade-up">
                <div class="card product-card">
                    <img src="${producto.img}" class="card-img-top" alt="[Imagen de ${producto.nombre}]">
                    <div class="card-body">
                        <h5 class="card-title" data-product-name="${
                            producto.nombre
                        }">${producto.nombre}</h5>
                        <label class="form-label" for="sizeSelect">Presentaciones:</label>
                        <select class="form-select product-size-select mb-3" onchange="actualizacionPrecioCategoria(this)">
                            ${opciones}
                        </select>
                        <p class="card-text product-price fs-4 fw-bold">Precio: $${separarMiles(
                            producto.precio
                        )}</p>
                        <div class="mt-5 d-flex justify-content-end">
                            <button class="btn btn-primary agregar-carrito" onclick="agregarProducto(this)"><i class="fa-solid fa-cart-plus"></i></button>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;

        productList.append(cardHtml);
    });
}

function actualizacionPrecioCategoria(element) {
    var price = $(element).find("option:selected").data("precio");
    var formattedPrice = "Precio: $" + separarMiles(parseFloat(price));
    $(element)
        .closest(".card-body")
        .find(".product-price")
        .text(formattedPrice);
}

function agregarProducto(btn) {
    const $card = $(btn).closest('.product-card');
    const name = $card.find('.card-title').data('product-name');
    const $sizeSelect = $card.find('.product-size-select');
    const size = $sizeSelect.find('option:selected').text();
    const price = $sizeSelect.find('option:selected').data('precio');

    const existingItem = cart.find(
        (item) => item.name === name && item.size === size
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, size, price, quantity: 1 });
    }

    showToast("¡Producto añadido!");
    renderCart();
}

function renderCart() {
    const cartItemsContainer = $("#cart-items");
    cartItemsContainer.empty();
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.html(
            '<p class="text-center text-muted">Tu carrito está vacío.</p>'
        );
        $("#cart-total").text("Total: $0.00");
        $(".cart-counter").text("0").hide();
        return;
    }

    $(".cart-counter")
        .text(cart.reduce((acc, item) => acc + item.quantity, 0))
        .show();

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const itemHtml = `
            <div class="cart-item">
                <div class="cart-item-details">
                    <p class="mb-0">${item.name} - ${item.size}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="btn btn-sm btn-outline-secondary btn-decrease" data-index="${index}">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary btn-increase" data-index="${index}">+</button>
                </div>
                <strong class="mx-3">$${separarMiles(subtotal)}</strong>
                <button class="btn btn-sm btn-danger btn-remove" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.append(itemHtml);
    });

    $("#cart-total").text(`Total: $${total.toFixed(2)}`);
}

$("#cart-items").on("click", ".btn-increase", function () {
    const index = $(this).data("index");
    cart[index].quantity++;
    renderCart();
});

$("#cart-items").on("click", ".btn-decrease", function () {
    const index = $(this).data("index");
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    renderCart();
});

$("#cart-items").on("click", ".btn-remove", function () {
    const index = $(this).data("index");
    cart.splice(index, 1);
    renderCart();
});

$(".product-size-select").on("change", function () {
    var price = $(this).val();
    var formattedPrice = "$" + parseFloat(price).toFixed(2);
    $(this).closest(".card-body").find(".product-price").text(formattedPrice);
});



function showToast(message) {
    const toast = $("#toast-notification");
    toast.text(message).fadeIn(400);
    setTimeout(() => toast.fadeOut(400), 2000);
}

function enviarPedidoWhatsap() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Añade productos para hacer un pedido.');
        return;
    }

    let message = '¡Hola! Quisiera hacer el siguiente pedido:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `* *Producto:* ${item.name} - ${item.size} (Cantidad: ${item.quantity})\n\n`;
    });

    message += `*TOTAL DEL PEDIDO: $${separarMiles(total)}*`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
}

function separarMiles(numero) {
    return numero.toLocaleString("es-CO"); // formato Colombia
}

init();
