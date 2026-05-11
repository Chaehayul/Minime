import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewsService, InterviewAnalysis } from './interviews.service';

const allowedAudioMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/mpga',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'video/mp4',
  'video/webm',
];

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `interview-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!allowedAudioMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('mp3, mp4, m4a, wav, webm 형식의 음성 파일만 업로드할 수 있습니다.'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  analyzeInterview(@UploadedFile() file: Express.Multer.File): Promise<InterviewAnalysis> {
    if (!file) {
      throw new BadRequestException('분석할 음성 파일을 업로드해 주세요.');
    }
    return this.interviewsService.analyze(file);
  }
}
