## Service File Folder
/etc/systemd/system/morchess.service

## First-Time Server Setup (Once)
sudo useradd -r -s /bin/false morchess
sudo mkdir -p /var/www/morchess-api/data
sudo chown -R morchess:morchess /var/www/morchess-api

## Enable It
sudo systemctl daemon-reload
sudo systemctl enable morchess
sudo systemctl start morchess

## Check logs:
journalctl -u morchess -f


## Restart
sudo systemctl restart morchess


## Deploy Folder Ownerships
sudo mkdir -p /var/www/morchess-api
sudo chown -R deploy:deploy /var/www/morchess-api

