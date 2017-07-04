HOST=${HOST:-floats.superserious.co}
ROOT=${ROOT:-ubuntu}
VERSION=${VERSION:-v1}
RUN_COMMAND=${RUN_COMMAND:-/usr/bin/npm start}

ssh "$ROOT"@"$HOST" sudo mkdir -p /opt/src/"$VERSION"
ssh "$ROOT"@"$HOST" sudo mkdir -p /"$VERSION".git
ssh "$ROOT"@"$HOST" sudo git init --bare /"$VERSION".git
ssh "$ROOT"@"$HOST" sudo chown -R git:git /"$VERSION".git
ssh "$ROOT"@"$HOST" sudo chown -R git:git /opt/src/"$VERSION"
echo "#!/bin/sh
git --work-tree=/opt/src/${VERSION} --git-dir=/${VERSION}.git checkout -f
(cd /opt/src/$VERSION && NODE_ENV=production npm install)
sudo /bin/systemctl restart ${VERSION}.service
sudo /bin/systemctl status ${VERSION}.service" | ssh "$ROOT"@"$HOST" "sudo tee /${VERSION}.git/hooks/post-receive >/dev/null"
ssh "$ROOT"@"$HOST" sudo "chmod +x /${VERSION}.git/hooks/post-receive"

echo "[Unit]
Description=${VERSION} nodejs app

[Service]
Environment=NODE_ENV=production
Environment=PORT=3001
WorkingDirectory=/opt/src/${VERSION}
ExecStart=${RUN_COMMAND}
Restart=always

[Install]
WantedBy=multi-user.target" | ssh "$ROOT"@"$HOST" "sudo tee /etc/systemd/system/${VERSION}.service >/dev/null"

ssh "$ROOT"@"$HOST" sudo systemctl enable "${VERSION}"

git remote add "${VERSION}" "ssh://git@$HOST:/${VERSION}.git"

# manual step: adding nginx configuration
#
# location /v1.1/ {
#        rewrite ^/v1.1(.*) $1 break;
#        proxy_pass http://localhost:3000;
# }
#
# location /v1/ {
#         rewrite ^/v1(.*) $1 break;
#         proxy_pass http://localhost:3001;
# }
#
# location / {
#         proxy_pass http://localhost:3000;
# }
