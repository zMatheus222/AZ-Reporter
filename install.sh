#!/bin/bash

##para desenvolvimento, instalação docker, mattermost

##atualizar repositorio
#yum update

##instalar yum utils
#sudo yum install -y yum-utils

##texto que deve ser movido para primeira linha de '/etc/yum.repos.d/docker-ce.repo'
#[centos-extras]
#name=Centos extras - $basearch
#baseurl=http://mirror.centos.org/centos/7/extras/x86_64
#enabled=1
#gpgcheck=1
#gpgkey=http://centos.org/keys/RPM-GPG-KEY-CentOS-7

#vi /etc/yum.repos.d/docker-ce.repo

##instalação das dependencias necessárias
#yum -y install slirp4netns fuse-overlayfs container-selinux

##instalação dos sistemas docker
#sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

##adicionar docker engine ao inicializar o sistema
#systemctl enable docker --now

##essencial para executar a aplicação:

# system_OS=""

# if [ -f /etc/os-release ]; then
#     source /etc/os-release
#     system_OS=$PRETTY_NAME
#     echo "Sistema Operacional: $system_OS"
# else
#     echo "Arquivo /etc/os-release não encontrado. Não é possível determinar o sistema operacional."
# fi

# if [ $system_OS | grep -q "CentOS"]; then

# else

# fi

echo "Instalando gerenciador 'dnf'"
sudo yum install dnf -y

echo "Instalando o 'nodejs'"
dnf install nodejs -y

echo "Instalando o 'npm'"
dnf install npm -y

echo "instalando lib express"
npm install express

echo "instalando lib cors"
npm install cors

echo "instalando lib canvas"
npm install --save html2canvas

echo "instalando lib axios"
npm install axios