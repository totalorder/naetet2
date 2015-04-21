<?php

$index_html = fopen("index.html", "r") or die("Unable to open file!");
$file_content = fread($index_html, filesize("index.html"));
fclose($index_html);
$file_content = str_replace("//{{SETUP}}", "load_path = '" . $_GET['path'] . "';", $file_content);
echo $file_content;

?>