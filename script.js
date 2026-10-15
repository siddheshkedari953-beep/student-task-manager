pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'eu-north-1'
        AWS_ACCOUNT_ID = '756501293924'
        ECR_REPOSITORY = 'student-task-manager'
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_DEPLOYMENT = 'student-task-manager'
        K8S_CONTAINER = 'student-task-manager'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Validating project files'

                sh '''
                    set -eu

                    test -f index.html
                    test -f style.css
                    test -f script.js
                    test -f Dockerfile
                    test -f Jenkinsfile

                    echo "All required project files exist."
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation tests'

                sh '''
                    set -eu

                    grep -qi "Student Task Manager" index.html

                    grep -qi "script.js" index.html

                    grep -qi "style.css" index.html

                    echo "HTML and asset reference checks passed."
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image'

                sh '''
                    set -eu

                    docker build \
                      -t student-task-manager:${BUILD_NUMBER} \
                      .

                    echo "Docker image built successfully."
                '''
            }
        }

        stage('Push to Amazon ECR') {
            steps {
                echo 'Authenticating with Amazon ECR'

                sh '''
                    set -eu

                    aws sts get-caller-identity

                    aws ecr describe-repositories \
                      --repository-names "$ECR_REPOSITORY" \
                      --region "$AWS_REGION" >/dev/null

                    aws ecr get-login-password \
                      --region "$AWS_REGION" |
                    docker login \
                      --username AWS \
                      --password-stdin \
                      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

                    docker tag \
                      student-task-manager:${BUILD_NUMBER} \
                      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:${BUILD_NUMBER}"

                    docker push \
                      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:${BUILD_NUMBER}"

                    echo "Image pushed to Amazon ECR."
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying updated image to Kubernetes'

                sh '''
                    set -eu

                    kubectl set image \
                      deployment/$K8S_DEPLOYMENT \
                      $K8S_CONTAINER="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:${BUILD_NUMBER}"

                    kubectl rollout status \
                      deployment/$K8S_DEPLOYMENT \
                      --timeout=180s

                    echo "Kubernetes deployment updated successfully."
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: CI/CD pipeline completed.'
        }

        failure {
            echo 'FAILED: Check the first failing stage in Console Output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
