import React, { useEffect, useState } from "react"
import Home from './pages/home';

export default function AppComponent({configuration}) {
	const serviceUrl = (configuration?.portletInstance?.serviceUrl);
	const linkText = (configuration?.portletInstance?.linkText);
	const hideSearch = (configuration?.portletInstance?.hideSearch);
	const urlDetail = (configuration?.portletInstance?.urlDetail);
	const filtersConfigRaw = (configuration?.portletInstance?.filtersConfigRaw);
	const useAsResultPage = (configuration?.portletInstance?.useAsResultPage);
	const filterERC = (configuration?.portletInstance?.filterERC);
	const isGlobal = (configuration?.portletInstance?.isGlobal);
	const useCurrentEntryCategories = (configuration?.portletInstance?.useCurrentEntryCategories);
	const relatedVocabularyERC = (configuration?.portletInstance?.relatedVocabularyERC);
	const relatedItemsLimit = (configuration?.portletInstance?.relatedItemsLimit);
	const relatedTitle = (configuration?.portletInstance?.relatedTitle);


    return (
        <Home
            serviceUrl={serviceUrl}
            linkText={linkText}
            hideSearch={hideSearch}
            urlDetail={urlDetail}
            filtersConfigRaw={filtersConfigRaw}
            useAsResultPage={useAsResultPage}
            isGlobal={isGlobal}
            useCurrentEntryCategories={useCurrentEntryCategories}
            relatedVocabularyERC={relatedVocabularyERC}
            relatedItemsLimit={relatedItemsLimit}
            relatedTitle={relatedTitle}
            filterERC={filterERC}/>
    );
}