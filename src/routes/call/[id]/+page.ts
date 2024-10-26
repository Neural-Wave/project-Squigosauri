import { AssemblyAI } from 'assemblyai';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// const client = new AssemblyAI({ apiKey: '08299525b5064f8f98eaebaa2b5f8356' });
	// const token = await client.realtime.createTemporaryToken({ expires_in: 999999 });

	// console.log({ token });

	return {
		token: '53b2ae42e602b90f76c30e52e4a0ae8f94fb965a95512f3ab90953f384e875d0'
	};
};
