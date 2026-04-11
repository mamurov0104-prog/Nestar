import { Resolver } from '@nestjs/graphql';
import { LikeService } from './like.service';

@Resolver()
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}
}
