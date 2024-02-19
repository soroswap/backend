import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mercury } from 'mercury-sdk';
import * as sdk from 'stellar-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { constants } from 'src/constants';

const mercuryInstance = new Mercury({
  backendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
  graphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
  email: process.env.MERCURY_TESTER_EMAIL,
  password: process.env.MERCURY_TESTER_PASSWORD,
});

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}
}
