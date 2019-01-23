import {Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  requestBody,
} from '@loopback/rest';
import {ADC} from '../models';
import {ADCRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class ADCController {
  constructor(
    @repository(ADCRepository)
    public adcRepository: ADCRepository,
  ) {}

  @post(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'ADC model instance',
        content: {'application/json': {schema: {'x-ts-type': ADC}}},
      },
    },
  })
  async create(@requestBody() adc: ADC): Promise<ADC> {
    return await this.adcRepository.create(adc);
  }

  @get(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'Array of ADC model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': ADC}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ADC)) filter?: Filter,
  ): Promise<ADC[]> {
    return await this.adcRepository.find(filter);
  }
}
