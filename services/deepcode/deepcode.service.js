'use strict'
const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const platformMapping = {
  github: 'gh',
  bitbucket: 'bb',
  gitlab: 'gl',
}
const schema = Joi.object({
  version: Joi.string().required(),
}).required()

module.exports = class Deepcode extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'deepcode',
      pattern: `${this.pattern}`,
    }
  }

  static get pattern() {
    return `:host(${Object.keys(platformMapping).join('|')})/:user/:repo`
  }

  static get examples() {
    return [
      {
        title: 'LGTM Grade',
        namedParams: {
          platform: 'github',
          user: 'apache',
          repo: 'cloudstack',
        },
        staticPreview: this.render({
          language: 'java',
          data: {
            languages: [
              {
                grade: 'C',
              },
            ],
          },
        }),
      },
    ]
  }

  static render({ data }) {
    const { grade, color } = this.getGradeAndColor({ data })
    return {
      label: `deepcode`,
      message: grade,
      color,
    }
  }

  async fetch({ gem }) {
    return this._requestJson({
      schema,
      url: `https://rubygems.org/api/v1/gems/${gem}.json`,
    })
  }

  async handle({ platform, user, repo }) {
    const data = await this.fetch({ platform, user, repo })
    return this.constructor.render({ data })
  }
}
