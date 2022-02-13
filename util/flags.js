// command line args

module.exports = {
  shared: [
    {
      name: 'file',
      char: 'f',
      hasValue: true,
      description: 'specify target filename',
    },
    {
      name: 'overwrite',
      char: 'o',
      description: 'overwrite destination config vars',
    },
    { name: 'quiet', char: 'q', description: 'supress all non-error output' },
    {
      name: 'expanded',
      char: 'e',
      description: 'allow non-standard characters in variable names',
    },
    {
      name: 'pipeline-name',
      description:
        'pull or push the configuration of a specific pipeline. If provided, must also specify pipeline-stage',
      hasValue: true,
    },
    {
      name: 'pipeline-stage',
      description:
        'pull or push the configuration of a specific pipeline. If provided, must also specify pipeline-name',
      hasValue: true,
    },
  ],
  pipelineFlagsAreValid: (flags) => {
    const pipelineName = flags['pipeline-name']
    const pipelineStage = flags['pipeline-stage']

    if ((pipelineName || pipelineStage) && !(pipelineName && pipelineStage)) {
      return false
    }
    return true
  },
  buildPullUrl: async (context, heroku, cli) => {
    const pipelineName = context.flags['pipeline-name']
    const pipelineStage = context.flags['pipeline-stage']

    let pullUrl

    if (pipelineName) {
      let pipelineData
      try {
        pipelineData = await heroku.get(`/pipelines/${pipelineName}`)
      } catch (err) {
        cli.error('problem fetching pipeline info')
        cli.exit(1, String(err))
      }
      pullUrl = `/pipelines/${pipelineData.id}/stage/${pipelineStage}/config-vars`
    } else {
      if (!context.app) {
        cli.exit(
          1,
          'Must specify `--app` parameter, or `--pipeline-name` and `--pipeline-stage`'
        )
      }
      pullUrl = `/apps/${context.app}/config-vars`
    }
    return pullUrl
  },
}
