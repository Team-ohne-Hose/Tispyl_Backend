# Backup Tasks

## creating a datadump from MariaDB

Generally, the password for the mariaDB is already stored in the environment and does an auto-login,
but if you want to extract the password, you can use this command to get the credentials: `my_print_defaults client`

With this data, you can create a dump like this: `mysqldump -u tispyl -p<SQL_PASSWORD> tispyl > data-dump.sql`
_(Attention, since there is no space between `-p` and the password)_
To use the password in the environment, the -p flag has to be ommited.

now, the datadump is in the `data-dump.sql` file.

## uploading to dropbox

With curl, we can upload this file to dropbox. We have to create an API Key. (OAuth2)

[You can do this here: (*https://www.dropbox.com/developers/apps/create*)](https://www.dropbox.com/developers/apps/create)

With this key, we use:
```
curl -s --output -X POST https://content.dropboxapi.com/2/files/upload \
    --header "Authorization: Bearer <OAuth2-Apikey>" \
    --header "Dropbox-API-Arg: {\"path\": \"/dump.sql\",\"mode\": \"overwrite\"}" \
    --header "Content-Type: application/octet-stream" \
    --data-binary @data-dump.sql
```
This puts the data-dump.sql we created earlier into the dropbox. _(while overwriting the old one)_

The way i created the token to only have limited access, the root directory from the APIs POV is in `/Dropbox/Apps/Tispyl_Data_Dump/`.

## creating the cronjob

Uberspace wrote a pretty good manual: [source](https://manual.uberspace.de/daemons-cron/)