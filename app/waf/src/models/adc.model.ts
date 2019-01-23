import {Entity, model, property} from '@loopback/repository';

@model()
export class ADC extends Entity {
  @property({
    type: 'string',
    id: true,
    required: false,
  })
  id: string;

  @property({
    type: 'string',
    required: false,
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
  })
  host: string;

  @property({
    type: 'number',
    required: false,
    default: 443,
  })
  port: number;

  constructor(data?: Partial<ADC>) {
    super(data);
  }
}
