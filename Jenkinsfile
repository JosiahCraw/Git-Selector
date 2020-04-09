pipeline {
  agent any
  stages {
    stage('package') {
      agent {
        dockerfile {
          filename 'ci/package/Dockerfile'
        }

      }
      steps {
        sh 'npm run dist'
        sh 'cd dist'
        archiveArtifacts '*.snap'
        archiveArtifacts '*.exe'
        archiveArtifacts '*.deb'
        archiveArtifacts '*.pacman'
      }
    }

  }
}