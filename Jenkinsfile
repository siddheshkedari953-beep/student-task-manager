
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-2'
        ECR_REGISTRY = '756501293924.dkr.ecr.ap-southeast-2.amazonaws.com'
        ECR_REPOSITORY = 'student-task-manager'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source from GitHub'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Validating project files'
                sh '''
                    test -f index.html
                    test -f style.css
                    test -f script.js
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation'
                sh '''
                    grep -q "Student Task Manager" index.html
                    grep -q "addTask" script.js
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image'
                sh '''
                    docker build -t student-task-manager:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Push to Amazon ECR') {
            steps {
                echo 'Authenticating with Amazon ECR'
                sh '''
                    set -eu
                    aws sts get-caller-identity
                    aws ecr get-login-password --region "$AWS_REGION" |
                        docker login --username AWS --password-stdin "$ECR_REGISTRY"

                    docker tag student-task-manager:${BUILD_NUMBER} \
                        "$ECR_REGISTRY/$ECR_REPOSITORY:${BUILD_NUMBER}"

                    docker tag student-task-manager:${BUILD_NUMBER} \
                        "$ECR_REGISTRY/$ECR_REPOSITORY:latest"

                    docker push "$ECR_REGISTRY/$ECR_REPOSITORY:${BUILD_NUMBER}"
                    docker push "$ECR_REGISTRY/$ECR_REPOSITORY:latest"
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD image build and ECR push completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output for the error.'
        }
    }
}

