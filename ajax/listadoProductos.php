<?php 

    require_once('../config/conexion.php');

    $db = new conexion();

    $sql = "SELECT 
                p.id_producto  AS idProducto, 
                p.nombre_produto AS nombre, 
                p.id_categoria AS categoria, 
                p.img AS img, 
                pp.id_presentacion AS idPresentacion,
                pp.tamano_presentacion AS tamanio, 
                pp.precio_venta_cliente_presentacion AS precio
            from 
                productos p
                inner join presentacion_producto pp ON pp.id_producto  = p.id_producto
                WHERE p.id_producto NOT IN (11,12)";

                
    $productos = $db->select($sql);
    echo json_encode($productos);