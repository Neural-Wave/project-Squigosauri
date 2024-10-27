import { ElevenLabsClient } from 'elevenlabs';

export async function GET({ url }) {
	const elevenlabs = new ElevenLabsClient({
		apiKey: 'sk_2bf5abb69dcea64190b2f72f0435ee100650a6a3b95bc795'
	});

	const query = url.searchParams.get('question') ?? '';

	const audioStream = await elevenlabs.generate({
		stream: true,
		voice: 'Jessica',
		text: query,
		model_id: 'eleven_turbo_v2_5'
	});

	const chunks: Buffer[] = [];
	for await (const chunk of audioStream) {
		chunks.push(chunk);
	}

	const content = Buffer.concat(chunks);

	return new Response(content, { headers: { contentType: 'audio/mpeg' } });
}
