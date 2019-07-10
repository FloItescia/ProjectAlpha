#
# Importation des modules csv et mysql.connector, nécessaires respectivement à la lecture
#
import csv
import mysql.connector

#
# Ouverture du fichier source.
#

fname = "csvfinal.csv"
file = open(fname, "r")

try:
    #
    # Création du 'lecteur' CSV
    #
    reader = csv.reader(file)

    #
    # Connexion à la base de données et création du 'curseur' qui va servir
    # à parcourir la base et éxécuter la requête d'insertion
    #
    baseDeDonnees = mysql.connector.connect(host="localhost", user="root", password="", database="alpha")
    curseur = baseDeDonnees.cursor()

    #
    # On va utiliser une boucle for pour insérer chaque ligne du fichier csv
    # (qui correspond à une information) dans la liste qui correspondra aux "VALUES" à
    # insérer dans la base de données
    #

    #
    # On initialise une liste vide ([])
    #
    liste = []

    #
    # On boucle sur chaque ligne du lecteur CSV
    #
    for row in reader:
        #
        # On ajoute la ligne à la liste précedemment initialisée
        #
        liste.append(str(row[0]))

    #
    # Execution de la requête d'insertion qui aura comme VALUES des chaines de caractères
    # correspondant à chaque entrée de la liste
    #
    curseur.execute("INSERT INTO credentials (AdresseMac, username, password) VALUES (%s, %s, %s)",
                    (liste[0], liste[1], liste[2]))
    baseDeDonnees.commit()

finally:
    #
    # Fermeture du fichier source
    #
    file.close()

#
# Fermeture de la base de données
#
baseDeDonnees.close()
