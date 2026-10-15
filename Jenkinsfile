pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-2'
        ECR_REGISTRY = '756501293924.dkr.ecr.ap-southeast-2.amazonaws.com'
        ECR_REPOSITORY = 'student-task-manager'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
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
                    set -eu
                    test -f index.html
                    test -f style.css
                    test -f script.js
                    test -f Dockerfile
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running project validation'
                sh '''
                    set -eu

                    # HTML has the title and links the script and stylesheet
                    grep -q "Student Task Manager" index.html
                    grep -q 'src="script.js"' index.html
                    grep -q 'href="style.css"' index.html

                    # JS has the main layers of the new architecture
                    grep -q "const Store" script.js
                    grep -q "const Controller" script.js

                    # JS has no syntax errors (only runs if Node is installed)
                    if command -v node >/dev/null 2>&1; then
                        node --check script.js
                    fi
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image'
                sh '''
                    set -eu
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

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Refreshing Amazon ECR image pull secret'
                sh '''
                    set +x
                    set -eu

                    ECR_PASSWORD="$(aws ecr get-login-password --region "$AWS_REGION")"

                    kubectl create secret docker-registry ecr-registry-secret \
                        --namespace student-task-manager \
                        --docker-server="$ECR_REGISTRY" \
                        --docker-username=AWS \
                        --docker-password="$ECR_PASSWORD" \
                        --dry-run=client -o yaml |
                    kubectl apply -f -

                    unset ECR_PASSWORD
                '''

                echo 'Updating Kubernetes deployment'
                sh '''
                    set -eu

                    kubectl set image deployment/student-task-manager \
                        student-task-manager="$ECR_REGISTRY/$ECR_REPOSITORY:${BUILD_NUMBER}" \
                        --namespace student-task-manager

                    kubectl rollout status deployment/student-task-manager \
                        --namespace student-task-manager \
                        --timeout=180s

                    kubectl get pods --namespace student-task-manager
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Image built, pushed to ECR, and deployed to Kubernetes!'
        }

        failure {
            echo 'FAILED: Check the Jenkins Console Output for the error.'
        }
    }
}
