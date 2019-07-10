<?php
	$_PARAM_host = 'localhost';
	$_PARAM_port = '3306';
	$_PARAM_database = 'alpha';
	$_PARAM_user = 'root';
	$_PARAM_pass = '';

	try {
		$connexion = new PDO('mysql:host='.$_PARAM_host.';dbname='.$_PARAM_database, $_PARAM_user, $_PARAM_pass);
	}

	catch(Exception $e)
		{
			echo 'Erreur : '.$e->getMessage();
?>
<br />
<?php
			echo 'N° : '.$e->getCode();
		}
?>
