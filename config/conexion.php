<?php 

    require_once('../config/config.php');

    class conexion 
    {
        protected $db;

        public function __construct() {
            $this->db = $this->conect();
        }

        private function conect(){
            try {
                $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                $conectar = new PDO($dsn, DB_USER, DB_PASS, $options);
                return $conectar;
            } catch (\Exception $e) {
                throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }

        public function execute($query){
            try {
                $sql = $this->db->prepare($query);
                $sql->execute();
                return $sql->rowCount();
            } catch (\Exception $e) {
                throw new Exception("Error al ejecutar la consulta: " . $e->getMessage());
            }
        }

        public function select($query){
            try {
                $sql = $this->db->prepare($query);
                $sql->execute();
                return $sql->fetchAll(PDO::FETCH_ASSOC);
            } catch (\Exception $e) {
                throw new Exception("Error al ejecutar la consulta de selección: " . $e->getMessage());
            }
        }
    }
    
