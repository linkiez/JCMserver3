pipeline {
    agent any
    environment {
        REV_LIST = ''
        LATEST_TAG = ''
        BASE_IMAGE = 'linkiez/jcmbackend'
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
                    def containerExists = true // Assume container exists initially
                    try {
                        sh(script: "docker inspect --format='{{.State.Running}}' JCMBackend", returnStdout: true).trim()
            } catch (Exception e) {
                        containerExists = false // If docker inspect command fails, container doesn't exist
                    }
                    if (containerExists) {
                        def containerImage = sh(script: 'docker inspect -f "{{.Config.Image}}" JCMBackend', returnStdout: true).trim()
                        def containerTag = containerImage.tokenize(':')[1]
                        if (containerTag == LATEST_TAG) {
                            error "Container with tag ${LATEST_TAG} already exists and is running. Stopping pipeline."
                } else {
                            echo 'Container exists but with a different tag. Proceeding.'
                        // Any further actions like stopping/removing the existing container can be scripted here.
                        }
            } else {
                        echo 'No existing container found. Proceeding with deployment.'
                    // Proceed with the pipeline as the container doesn't exist.
                    }
                }
            }
        }
        stage('Build') {
            steps {
                dir('JCMserver3') {
                    script {
                        // Initialize the attempt counter
                        def attempts = 0
                        def maxAttempts = 3
                        def success = false

                        // Loop to attempt the build up to maxAttempts times
                        while (!success && attempts < maxAttempts) {
                            // Increment the attempt counter at the beginning of each iteration
                            attempts++
                            try {
                                // Build the Docker image
                                sh "docker build . -t ${BASE_IMAGE}:${LATEST_TAG}"
                                // If the command succeeds, set success to true to exit the loop
                                success = true
                            } catch (Exception e) {
                                // If an exception is caught, print an error message
                                println("Attempt ${attempts} failed.")
                                // Sleep for a brief period before retrying
                                sleep(time: 10, unit: 'SECONDS')
                            }
                        }

                        // Check if the build was unsuccessful after maxAttempts
                        if (!success) {
                            error "Build failed after ${maxAttempts} attempts."
                        }
                    }
                }
            }
        }
        stage('Deploy Test') {
            steps {
                script {
                    // Remove Test Container as it may have been left running from a previous run
                    sh 'docker rm -f JCMBackendTest || true'
                    // Deploy Test Container
                    withCredentials([string(credentialsId: 'SSL', variable: 'urlSSL'), file(credentialsId: '1853bd4a-082c-46b1-9acc-4c8c12684574', variable: 'envFile')]) {
                        sh "docker run -d --name JCMBackendTest --volume ${urlSSL}:/app/ssl --env-file ${env.envFile} --network NW_JCMMETAIS --ip 172.19.0.5 -p 3000:3000 -p 3001:3001 ${BASE_IMAGE}:${LATEST_TAG}"
                    }
                    // Wait for 60 seconds to ensure container starts properly
                    sleep 60
                    withCredentials([usernamePassword(credentialsId: 'a449d81c-0bdd-4c1a-b256-96f6910a696c', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                        try {
                            // Make POST request to test the application inside the container

                            def inspect = sh(script: "docker inspect --format='{{.State.Health.Status}}' JCMBackendTest", returnStdout: true).trim()
                            if (inspect != "healthy") { error "Container failed to start properly." }
                            sh """
                               curl -X POST localhost:3000/login -H 'Content-Type: application/json' -d @- <<EOF
                                {
                                     "email": "${env.USERNAME}",
                                     "senha": "${PASSWORD}"
                                 }
                                 EOF
                               """
                        } catch (Exception e) {
                            // Print the log of the container before removing it
                            echo 'Fetching container logs...'
                            sh 'docker logs JCMBackendTest'
                            echo 'Removing the test container...'
                            sh 'docker rm -f JCMBackendTest'
                            error 'Test container responded with an error. Halting deployment.'
                        }
                    }
                }
            }
        }
        stage('Deploy Production') {
            steps {
                script {
                    // Remove Test Container as it passed the test
                    sh 'docker rm -f JCMBackendTest || true'
                    // Remove Production Container if it exists
                    sh 'docker rm -f JCMBackend || true'
                    // Proceed with deployment of the main container
                    withCredentials([string(credentialsId: 'SSL', variable: 'urlSSL'), file(credentialsId: '4e981c16-e24f-4f72-b6b9-8f2d8306ea2c', variable: 'envFile')]) {
                            sh "docker run -d --name JCMBackend --volume ${urlSSL}:/app/ssl --env-file ${env.envFile} --network NW_JCMMETAIS --ip 172.19.0.3 -p 57339:3001 --restart always ${BASE_IMAGE}:${LATEST_TAG}"
                    }
                }
            }
        }
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', '902264b9-7caf-4364-872d-0148f17a72e7') {
                        docker.image("${BASE_IMAGE}:${LATEST_TAG}").push()
                    }
                }
            }
        }
    }
}

