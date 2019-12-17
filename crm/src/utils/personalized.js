import { getPersonalization , getPersonalizationForDomain } from '@/api/login'
import store from '../store'

export async function personalizedUrlList(specialDomainName) {
	const { data } = await getPersonalizationForDomain({
		specialDomainName: specialDomainName
	})
	if (data.data) {
		const information = data.data
		await store.dispatch('personalizedRoutes', { information })
	}
	if (data.data && data.data.titleLogoStatus === 'START_UP') {
		setTimeout( () => { 
			var link = document.querySelector("link")
			if (data.data.titleLogo) {
				link.href = data.data.titleLogo
			} else link.href = ""
			
		}, 100);
	}
	if (data.data && data.data.titleCopyWritingStatus === 'START_UP') {
		setTimeout( () => { 
			document.title = data.data.titleCopyWriting
		}, 100);
	}
}

export async function personalizedIdList(tenantId) {
	const { data } = await getPersonalization({
		tenantId: tenantId
	})
	if (data.data) {
		const information = data.data
		await store.dispatch('personalizedRoutes', { information })
	}
	if (data.data && data.data.titleLogoStatus === 'START_UP') {
		setTimeout( () =>{ 
			var link = document.querySelector("link")
			link.href = data.data.titleLogo
		}, 100);
	}
	if (data.data && data.data.titleCopyWritingStatus === 'START_UP') {
		setTimeout( () =>{ 
			document.title = data.data.titleCopyWriting
		}, 100);
	}
}