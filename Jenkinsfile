pipeline {
    agent any
    environment {
        REV_LIST = ''
        LATEST_TAG = ''
    }
    stages {
        stage('Preparation') {
            steps {
                script {
                    deleteDir() // This deletes the workspace directory
                }
            }
        }
        stage('Verify Tag') {
            steps {
                script {
                    // Clone your repository and fetch tags
                    sh 'git clone https://github.com/linkiez/JCMserver3 && cd JCMserver3 && git fetch --tags'
                    // Fetch the latest tag
                    dir('JCMserver3') {
                        REV_LIST = sh(script: 'git rev-list --tags --max-count=1', returnStdout: true).trim()
                        LATEST_TAG = sh(script: 'git describe --tags ' + REV_LIST, returnStdout: true).trim()
                    }
                    def containerImage = sh(script: 'docker inspect -f "{{.Config.Image}}" JCMBackend', returnStdout: true).trim()
                    def containerTag = containerImage.tokenize(':')[1]
                        if (containerTag == LATEST_TAG) {
                        error "Container with tag ${LATEST_TAG} already exists. Stopping pipeline."
                        }
                }
            }
        }

        stage('Build') {
            steps {
                dir('JCMserver3') {
                    // Build your application/Docker image here using the latest tag
                    sh "docker build . -t linkiez/jcmbackend:${LATEST_TAG}"
                }
            }
        }
        stage('Deploy') {
            steps {
                    withCredentials([string(credentialsId: 'SSL', variable: 'urlSSL'), file(credentialsId: '    4e981c16-e24f-4f72-b6b9-8f2d8306ea2c', variable: 'envFile')]) {
                    // You can reference the secret as an environment variable
                    dir('JCMserver3') {
                        // Replace the current running container with the new one
                        sh "docker rm -f JCMBackend || true"
                        sh "docker run -d --name JCMBackend --volume ${env.urlSSL}:/app/ssl --env-file ${env.envFile} --network NW_JCMMETAIS --ip 172.19.0.3 -p 57339:3001 --restart always linkiez/jcmbackend:" + LATEST_TAG
                    }
                    }
            }
        }
    }
}
