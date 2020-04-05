pipeline {
  agent {
    dockerfile {
      filename 'ci/package/Dockerfile'
    }

  }
  stages {
    stage('package') {
      agent any
      steps {
        sh 'npm run package-all'
        sh 'cd release-builds && for i in */; do zip -r "${i%/}.zip" "$i"; done'
        archiveArtifacts '*.zip'
      }
    }

  }
}